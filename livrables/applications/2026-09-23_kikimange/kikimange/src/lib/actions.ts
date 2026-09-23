"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { MEMBRE_COOKIE, exigerMembre, exigerParent, verifierCodeFamille } from "./session";
import { ajouterJours, aujourdhui, creneauxDePeriode, DUREE_MAX_PERIODE, estIsoValide, jourEtMois, joursDeLaSemaine, lundiDe, momentFamilier, type Creneau } from "./jours";
import { notifierEnfantsAvecRappel, notifierParents } from "./push";
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

  // Première connexion sur cet appareil : on propose d'installer l'appli et d'activer les notifications.
  redirect("/installer");
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

  const moments = propres
    .sort((a, b) => (a.date + a.creneau).localeCompare(b.date + b.creneau))
    .map((s) => momentFamilier(s.date, s.creneau));
  await notifierParents({
    titre: propres.length ? `${membre.nom} vient ${propres.length} fois` : `${membre.nom} ne vient pas`,
    corps: propres.length ? `Semaine du ${jourEtMois(lundi)} : ${moments.join(", ")}.` : `Pas de repas la semaine du ${jourEtMois(lundi)}.`,
    url: `/semaine/${lundi}`,
  });

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
  await notifierParents({
    titre: `${membre.nom} ne vient pas`,
    corps: `Pas de repas la semaine du ${jourEtMois(lundi)}.`,
    url: `/semaine/${lundi}`,
  });
}

// ---------- Périodes (stage, vacances…) ----------

export type SaisiePeriode = {
  nom: string;
  debut: string;
  fin: string;
  dejeuner: boolean;
  diner: boolean;
  jours: number[]; // 1 = lundi … 7 = dimanche
  accompagnantIds: string[];
  supplementaires: number;
  partsAEmporter: number;
  platFavoriId: string | null;
  envies: string;
  commentaire: string;
};

/**
 * Inscrit un enfant à tous les repas d'une période. Chaque repas devient une participation modifiable
 * une à une ; un repas déjà prévu est conservé tel quel. Une période ne vaut pas réponse pour la semaine.
 */
export async function creerPeriode(s: SaisiePeriode): Promise<{ nbRepas: number }> {
  const membre = await exigerMembre();
  if (membre.role !== "enfant") throw new Error("Seuls les enfants s'inscrivent aux repas.");
  if (!estIsoValide(s.debut) || !estIsoValide(s.fin) || s.fin < s.debut) throw new Error("Dates invalides.");
  if (ajouterJours(s.debut, DUREE_MAX_PERIODE) < s.fin) throw new Error(`Une période dure au plus ${DUREE_MAX_PERIODE} jours.`);
  const jours = [...new Set(s.jours)].filter((j) => Number.isInteger(j) && j >= 1 && j <= 7).sort();
  if (!jours.length || (!s.dejeuner && !s.diner)) throw new Error("Choisis au moins un jour et un repas.");

  const debut = s.debut < aujourdhui() ? aujourdhui() : s.debut;
  const mesAccompagnants = new Set(
    (await prisma.accompagnant.findMany({ where: { membreId: membre.id }, select: { id: true } })).map((a) => a.id)
  );
  const platValide = s.platFavoriId ? await prisma.platFavori.findUnique({ where: { id: s.platFavoriId } }) : null;

  const creneaux = creneauxDePeriode(debut, s.fin, s.dejeuner, s.diner, jours);
  const existants = new Set(
    (await prisma.participation.findMany({ where: { membreId: membre.id, date: { gte: debut, lte: s.fin } }, select: { date: true, creneau: true } })).map(
      (p) => `${p.date}_${p.creneau}`
    )
  );
  const aCreer = creneaux.filter((c) => !existants.has(`${c.date}_${c.creneau}`));
  const accompagnantIds = [...new Set(s.accompagnantIds)].filter((id) => mesAccompagnants.has(id));

  // Transaction en lot (pas interactive) : compatible avec l'adaptateur HTTP de Turso en production.
  const periodeId = crypto.randomUUID();
  await prisma.$transaction([
    prisma.periode.create({
      data: { id: periodeId, membreId: membre.id, nom: texte(s.nom, 60), debut, fin: s.fin, dejeuner: s.dejeuner, diner: s.diner, jours: jours.join("") },
    }),
    ...aCreer.map((c) =>
      prisma.participation.create({
        data: {
          membreId: membre.id,
          date: c.date,
          creneau: c.creneau,
          periodeId,
          supplementaires: entier(s.supplementaires, 0, 20),
          partsAEmporter: entier(s.partsAEmporter, 0, 20),
          platFavoriId: platValide?.id ?? null,
          envies: texte(s.envies),
          commentaire: texte(s.commentaire),
          accompagnants: { connect: accompagnantIds.map((id) => ({ id })) },
        },
      })
    ),
  ]);

  revaliderTout();
  await notifierParents({
    titre: `${membre.nom} vient sur une période`,
    corps: `${texte(s.nom, 60) ?? "Période"} : ${aCreer.length} repas du ${jourEtMois(debut)} au ${jourEtMois(s.fin)}.`,
    url: `/semaine/${lundiDe(debut)}`,
  });
  return { nbRepas: aCreer.length };
}

/** Supprime une période : ses repas à venir disparaissent, les repas passés restent dans l'historique. */
export async function supprimerPeriode(id: string) {
  const membre = await exigerMembre();
  const periode = await prisma.periode.findUnique({ where: { id } });
  if (!periode || periode.membreId !== membre.id) throw new Error("Période introuvable.");
  await prisma.$transaction([
    prisma.participation.deleteMany({ where: { periodeId: id, date: { gte: aujourdhui() } } }),
    prisma.periode.delete({ where: { id } }),
  ]);
  revaliderTout();
}

// ---------- Réglages (parents) ----------

export async function modifierMembre(id: string, donnees: { telephone?: string; rappelActif?: boolean }) {
  await exigerParent();
  await prisma.membre.update({
    where: { id },
    data: {
      ...(donnees.telephone !== undefined ? { telephone: texte(donnees.telephone, 20) } : {}),
      ...(donnees.rappelActif !== undefined ? { rappelActif: !!donnees.rappelActif } : {}),
    },
  });
  revaliderTout();
}

export async function ajouterPlat(nomBrut: string) {
  await exigerParent();
  const nom = texte(nomBrut, 60);
  if (!nom) throw new Error("Nom du plat obligatoire.");
  const dernier = await prisma.platFavori.findFirst({ orderBy: { ordre: "desc" } });
  await prisma.platFavori.create({ data: { nom, ordre: (dernier?.ordre ?? -1) + 1 } });
  revaliderTout();
}

/** Retire un plat de la liste sans effacer les idées de menu déjà données. */
export async function retirerPlat(id: string) {
  await exigerParent();
  await prisma.platFavori.update({ where: { id }, data: { actif: false } });
  revaliderTout();
}

export async function deplacerPlat(id: string, sens: -1 | 1) {
  await exigerParent();
  const plats = await prisma.platFavori.findMany({ where: { actif: true }, orderBy: { ordre: "asc" } });
  const i = plats.findIndex((p) => p.id === id);
  const j = i + sens;
  if (i < 0 || j < 0 || j >= plats.length) return;
  [plats[i], plats[j]] = [plats[j], plats[i]];
  await prisma.$transaction(plats.map((p, ordre) => prisma.platFavori.update({ where: { id: p.id }, data: { ordre } })));
  revaliderTout();
}

export async function creerAbsence(debutDate: string, debutCreneau: Creneau, finDate: string, finCreneau: Creneau, note: string) {
  await exigerParent();
  if (!estIsoValide(debutDate) || !estIsoValide(finDate) || !creneauValide(debutCreneau) || !creneauValide(finCreneau)) throw new Error("Dates invalides.");
  if (`${finDate}${finCreneau === "diner" ? 1 : 0}` < `${debutDate}${debutCreneau === "diner" ? 1 : 0}`) throw new Error("La fin est avant le début.");
  await prisma.absenceParents.create({ data: { debutDate, debutCreneau, finDate, finCreneau, note: texte(note, 80) } });
  revaliderTout();
}

export async function supprimerAbsence(id: string) {
  await exigerParent();
  await prisma.absenceParents.delete({ where: { id } });
  revaliderTout();
}

export async function creerRepasOuvert(date: string, creneau: Creneau, menuBrut: string, heureBrute: string) {
  const parent = await exigerParent();
  if (!estIsoValide(date) || !creneauValide(creneau)) throw new Error("Repas invalide.");
  const menu = texte(menuBrut, 60);
  if (!menu) throw new Error("Indique le menu.");
  const heure = texte(heureBrute, 10);
  await prisma.repas.upsert({
    where: { date_creneau: { date, creneau } },
    create: { date, creneau, ouvert: true, menuAnnonce: menu, heure },
    update: { ouvert: true, menuAnnonce: menu, heure },
  });
  revaliderTout();
  const moment = momentFamilier(date, creneau);
  await notifierEnfantsAvecRappel({
    titre: `${moment.charAt(0).toUpperCase()}${moment.slice(1)} : ${menu}, qui vient ?`,
    corps: `Invitation de ${parent.nom}. Dis-le en un tap sur Kikimange.`,
    url: `/semaine/${lundiDe(date)}`,
  });
}

export async function annulerRepasOuvert(date: string, creneau: Creneau) {
  await exigerParent();
  if (!estIsoValide(date) || !creneauValide(creneau)) throw new Error("Repas invalide.");
  await prisma.repas.update({ where: { date_creneau: { date, creneau } }, data: { ouvert: false, menuAnnonce: null, heure: null } });
  revaliderTout();
}

// ---------- Notifications : abonnement de l'appareil ----------

export async function enregistrerAbonnement(abonnement: { endpoint: string; keys: { p256dh: string; auth: string } }, appareil: string) {
  const membre = await exigerMembre();
  if (!abonnement?.endpoint?.startsWith("https://") || !abonnement.keys?.p256dh || !abonnement.keys?.auth) throw new Error("Abonnement invalide.");
  await prisma.abonnementPush.upsert({
    where: { endpoint: abonnement.endpoint },
    create: { membreId: membre.id, endpoint: abonnement.endpoint, p256dh: abonnement.keys.p256dh, auth: abonnement.keys.auth, appareil: texte(appareil, 40) },
    update: { membreId: membre.id, p256dh: abonnement.keys.p256dh, auth: abonnement.keys.auth, appareil: texte(appareil, 40) },
  });
  revaliderTout();
}

export async function supprimerAbonnement(endpoint: string) {
  await exigerMembre();
  await prisma.abonnementPush.deleteMany({ where: { endpoint } });
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
