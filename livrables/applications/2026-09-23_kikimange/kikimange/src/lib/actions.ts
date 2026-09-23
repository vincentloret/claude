"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { MEMBRE_COOKIE, exigerMembre, exigerParent, verifierCodeFamille } from "./session";
import { aujourdhui, estIsoValide, joursDeLaSemaine, lundiDe, type Creneau } from "./jours";
import type { SaisieParticipation } from "./types";

// ---------- Validation des saisies ----------

function texte(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t === "" ? null : t;
}

function entier(v: unknown, min: number, max: number): number {
  const n = typeof v === "number" ? Math.round(v) : 0;
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : 0));
}

function creneauValide(c: unknown): c is Creneau {
  return c === "dejeuner" || c === "diner";
}

function lundiValide(lundi: unknown): string {
  if (!estIsoValide(lundi) || lundiDe(lundi) !== lundi) throw new Error("Semaine invalide.");
  return lundi;
}

function revaliderTout() {
  revalidatePath("/", "layout");
}

// ---------- Identification ----------

export async function choisirMembre(formData: FormData) {
  const membreId = formData.get("membreId");
  if (typeof membreId !== "string") return;

  if (!verifierCodeFamille(formData.get("code"))) {
    redirect("/qui-es-tu?erreur=code");
  }

  await prisma.membre.findUniqueOrThrow({ where: { id: membreId } });

  const store = await cookies();
  store.set(MEMBRE_COOKIE, membreId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  });

  redirect("/semaine");
}

export async function changerMembre() {
  const store = await cookies();
  store.delete(MEMBRE_COOKIE);
  redirect("/qui-es-tu");
}

// ---------- Semaine d'un enfant ----------

/**
 * Enregistre en une fois la semaine d'un enfant : crée, modifie et supprime ses participations
 * pour qu'elles correspondent exactement à `saisies`, puis note qu'il a répondu.
 */
export async function enregistrerSemaine(lundiBrut: string, saisies: SaisieParticipation[]): Promise<{ nbRepas: number }> {
  const membre = await exigerMembre();
  if (membre.role !== "enfant") throw new Error("Seuls les enfants s'inscrivent aux repas.");
  const lundi = lundiValide(lundiBrut);
  const jours = new Set(joursDeLaSemaine(lundi));

  const mesAccompagnants = new Set(
    (await prisma.accompagnant.findMany({ where: { membreId: membre.id }, select: { id: true } })).map((a) => a.id)
  );
  const platsExistants = new Set((await prisma.platFavori.findMany({ select: { id: true } })).map((p) => p.id));

  const propres = saisies
    .filter((s) => jours.has(s.date) && creneauValide(s.creneau))
    .map((s) => ({
      date: s.date,
      creneau: s.creneau,
      accompagnantIds: [...new Set(s.accompagnantIds)].filter((id) => mesAccompagnants.has(id)),
      supplementaires: entier(s.supplementaires, 0, 20),
      partsAEmporter: entier(s.partsAEmporter, 0, 20),
      platFavoriId: s.platFavoriId && platsExistants.has(s.platFavoriId) ? s.platFavoriId : null,
      envies: texte(s.envies),
      commentaire: texte(s.commentaire),
    }));

  const gardees = new Set(propres.map((s) => `${s.date}_${s.creneau}`));
  const existantes = await prisma.participation.findMany({
    where: { membreId: membre.id, date: { in: [...jours] } },
    select: { id: true, date: true, creneau: true },
  });
  const aSupprimer = existantes.filter((p) => !gardees.has(`${p.date}_${p.creneau}`)).map((p) => p.id);

  await prisma.$transaction([
    prisma.participation.deleteMany({ where: { id: { in: aSupprimer } } }),
    ...propres.map((s) => {
      const donnees = {
        supplementaires: s.supplementaires,
        partsAEmporter: s.partsAEmporter,
        platFavoriId: s.platFavoriId,
        envies: s.envies,
        commentaire: s.commentaire,
      };
      return prisma.participation.upsert({
        where: { membreId_date_creneau: { membreId: membre.id, date: s.date, creneau: s.creneau } },
        create: {
          ...donnees,
          membreId: membre.id,
          date: s.date,
          creneau: s.creneau,
          accompagnants: { connect: s.accompagnantIds.map((id) => ({ id })) },
        },
        update: { ...donnees, accompagnants: { set: s.accompagnantIds.map((id) => ({ id })) } },
      });
    }),
    prisma.reponseSemaine.upsert({
      where: { membreId_lundi: { membreId: membre.id, lundi } },
      create: { membreId: membre.id, lundi, neVientPas: propres.length === 0 },
      update: { neVientPas: propres.length === 0, reponduLe: new Date() },
    }),
  ]);

  revaliderTout();
  return { nbRepas: propres.length };
}

/** « Je ne viens pas cette semaine » : retire les repas à venir de la semaine et note la réponse. */
export async function neVientPasCetteSemaine(lundiBrut: string) {
  const membre = await exigerMembre();
  const lundi = lundiValide(lundiBrut);
  const aVenir = joursDeLaSemaine(lundi).filter((j) => j >= aujourdhui());

  await prisma.$transaction([
    prisma.participation.deleteMany({ where: { membreId: membre.id, date: { in: aVenir } } }),
    prisma.reponseSemaine.upsert({
      where: { membreId_lundi: { membreId: membre.id, lundi } },
      create: { membreId: membre.id, lundi, neVientPas: true },
      update: { neVientPas: true, reponduLe: new Date() },
    }),
  ]);

  revaliderTout();
}

// ---------- Accompagnants ----------

export async function ajouterAccompagnant(nomBrut: string, remarqueBrute: string) {
  const membre = await exigerMembre();
  const nom = texte(nomBrut, 60);
  if (!nom) throw new Error("Le prénom est obligatoire.");
  const a = await prisma.accompagnant.create({
    data: { membreId: membre.id, nom, remarque: texte(remarqueBrute, 80) },
    select: { id: true, nom: true, remarque: true },
  });
  revaliderTout();
  return a;
}

async function monAccompagnant(id: string) {
  const membre = await exigerMembre();
  const a = await prisma.accompagnant.findUnique({ where: { id } });
  if (!a || a.membreId !== membre.id) throw new Error("Accompagnant introuvable.");
  return a;
}

export async function modifierAccompagnant(id: string, nomBrut: string, remarqueBrute: string) {
  await monAccompagnant(id);
  const nom = texte(nomBrut, 60);
  if (!nom) throw new Error("Le prénom est obligatoire.");
  await prisma.accompagnant.update({ where: { id }, data: { nom, remarque: texte(remarqueBrute, 80) } });
  revaliderTout();
}

export async function archiverAccompagnant(id: string, archive: boolean) {
  await monAccompagnant(id);
  await prisma.accompagnant.update({ where: { id }, data: { archive } });
  revaliderTout();
}

// ---------- Invités des parents ----------

export async function ajouterInvite(date: string, creneau: Creneau, nomBrut: string, nombreBrut: number, remarqueBrute: string) {
  await exigerParent();
  if (!estIsoValide(date) || !creneauValide(creneau)) throw new Error("Repas invalide.");
  const nom = texte(nomBrut, 60);
  if (!nom) throw new Error("Le prénom est obligatoire.");

  await prisma.repas.upsert({
    where: { date_creneau: { date, creneau } },
    create: { date, creneau },
    update: {},
  });
  await prisma.inviteRepas.create({
    data: { repasDate: date, repasCreneau: creneau, nom, nombre: entier(nombreBrut, 1, 30), remarque: texte(remarqueBrute, 80) },
  });
  revaliderTout();
}

export async function supprimerInvite(id: string) {
  await exigerParent();
  await prisma.inviteRepas.delete({ where: { id } });
  revaliderTout();
}
