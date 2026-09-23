import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getMembreIdConnecte } from "./session";
import { ajouterJours, cleCreneau, CRENEAUX, joursDeLaSemaine, type Creneau } from "./jours";
import { couvertsParticipation, NB_PARENTS, parentsAbsents } from "./couverts";
import type { CreneauVue, EnfantVue, MembreVue, ParticipationVue, SemaineVue } from "./types";

const selectMembre = { id: true, nom: true, initiales: true, couleur: true, role: true } as const;

const includeParticipation = {
  membre: { select: selectMembre },
  accompagnants: { select: { id: true, nom: true, remarque: true } },
  platFavori: { select: { id: true, nom: true } },
  periode: { select: { id: true, nom: true } },
} as const;

type ParticipationBrute = Awaited<ReturnType<typeof lireParticipations>>[number];

function lireParticipations(debut: string, fin: string) {
  return prisma.participation.findMany({
    where: { date: { gte: debut, lte: fin } },
    include: includeParticipation,
    orderBy: { membre: { ordre: "asc" } },
  });
}

function versParticipationVue(p: ParticipationBrute): ParticipationVue {
  return {
    id: p.id,
    membre: p.membre,
    accompagnants: p.accompagnants,
    supplementaires: p.supplementaires,
    partsAEmporter: p.partsAEmporter,
    plat: p.platFavori,
    envies: p.envies,
    commentaire: p.commentaire,
    periode: p.periode,
  };
}

// Le layout (app) et la page appellent chacun getMembreConnecte() dans la même requête :
// cache() déduplique pour n'interroger la base qu'une fois.
export const getMembreConnecte = cache(async (): Promise<MembreVue> => {
  const id = await getMembreIdConnecte();
  if (!id) redirect("/qui-es-tu");
  const m = await prisma.membre.findUnique({ where: { id }, select: selectMembre });
  if (!m) redirect("/qui-es-tu");
  return m;
});

export async function getMembres(): Promise<MembreVue[]> {
  return prisma.membre.findMany({ select: selectMembre, orderBy: { ordre: "asc" } });
}

/** Tous les créneaux entre deux dates incluses, avec présents, invités, repas ouverts et absences. */
export async function getCreneaux(debut: string, fin: string): Promise<Record<string, CreneauVue>> {
  const [participations, repas, absences] = await Promise.all([
    lireParticipations(debut, fin),
    prisma.repas.findMany({ where: { date: { gte: debut, lte: fin } }, include: { invites: true } }),
    prisma.absenceParents.findMany({ where: { debutDate: { lte: fin }, finDate: { gte: debut } } }),
  ]);

  const creneaux: Record<string, CreneauVue> = {};
  for (let date = debut; date <= fin; date = ajouterJours(date, 1)) {
    for (const creneau of CRENEAUX) {
      const absents = parentsAbsents(absences, date, creneau);
      creneaux[cleCreneau(date, creneau)] = {
        date,
        creneau,
        participations: [],
        invites: [],
        ouvert: false,
        menuAnnonce: null,
        heure: null,
        parentsAbsents: absents,
        couverts: absents ? 0 : NB_PARENTS,
        couvertsParents: absents ? 0 : NB_PARENTS,
      };
    }
  }

  for (const p of participations) {
    const c = creneaux[cleCreneau(p.date, p.creneau)];
    if (!c) continue;
    c.participations.push(versParticipationVue(p));
    c.couverts += couvertsParticipation(p);
  }

  for (const r of repas) {
    const c = creneaux[cleCreneau(r.date, r.creneau)];
    if (!c) continue;
    c.ouvert = r.ouvert;
    c.menuAnnonce = r.menuAnnonce;
    c.heure = r.heure;
    c.invites = r.invites.map((i) => ({ id: i.id, nom: i.nom, nombre: i.nombre, remarque: i.remarque }));
    c.couverts += r.invites.reduce((s, i) => s + i.nombre, 0);
  }

  return creneaux;
}

export async function getSemaine(lundi: string): Promise<SemaineVue> {
  const jours = joursDeLaSemaine(lundi);
  const [creneaux, reponses, enfants] = await Promise.all([
    getCreneaux(jours[0], jours[6]),
    prisma.reponseSemaine.findMany({ where: { lundi } }),
    prisma.membre.findMany({
      where: { role: "enfant" },
      select: { ...selectMembre, telephone: true },
      orderBy: { ordre: "asc" },
    }),
  ]);

  return {
    lundi,
    jours,
    creneaux,
    reponses: reponses.map((r) => ({ membreId: r.membreId, neVientPas: r.neVientPas, reponduLe: r.reponduLe.toISOString() })),
    enfants: enfants as EnfantVue[],
  };
}

export async function getCreneau(date: string, creneau: Creneau): Promise<CreneauVue> {
  const creneaux = await getCreneaux(date, date);
  return creneaux[cleCreneau(date, creneau)];
}

export async function getAccompagnants(membreId: string) {
  return prisma.accompagnant.findMany({
    where: { membreId },
    select: { id: true, nom: true, remarque: true, archive: true },
    orderBy: [{ archive: "asc" }, { creeLe: "asc" }],
  });
}

export async function getPlatsFavoris() {
  return prisma.platFavori.findMany({ where: { actif: true }, select: { id: true, nom: true }, orderBy: { ordre: "asc" } });
}
