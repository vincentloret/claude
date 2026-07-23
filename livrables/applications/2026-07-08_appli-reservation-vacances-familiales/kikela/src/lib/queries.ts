import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getFoyerIdConnecte } from "./session";
import { isoOf } from "./calendar";
import type { Lieu, Foyer, Sejour } from "./data";

export async function getLieux(): Promise<Lieu[]> {
  const rows = await prisma.lieu.findMany({
    include: {
      equipements: { orderBy: { ordre: "asc" } },
      photos: { orderBy: { ordre: "asc" } },
    },
    orderBy: { nom: "asc" },
  });
  return rows.map((l) => ({
    id: l.id,
    slug: l.slug,
    nom: l.nom,
    region: l.region,
    ambiance: l.ambiance,
    couleur: l.couleur,
    couleurContainer: l.couleurContainer,
    couleurOnContainer: l.couleurOnContainer,
    icone: l.icone,
    capacite: l.capacite,
    chambres: l.chambres,
    description: l.description,
    equipements: l.equipements.map((e) => ({ icone: e.icone, label: e.label })),
    photos: l.photos.map((p) => p.url),
    videoUrl: l.videoUrl ?? undefined,
    lienUrl: l.lienUrl ?? undefined,
    lienLabel: l.lienLabel ?? undefined,
  }));
}

export async function getLieuBySlug(slug: string): Promise<Lieu | null> {
  const l = await prisma.lieu.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      equipements: { orderBy: { ordre: "asc" } },
      photos: { orderBy: { ordre: "asc" } },
    },
  });
  if (!l) return null;
  return {
    id: l.id,
    slug: l.slug,
    nom: l.nom,
    region: l.region,
    ambiance: l.ambiance,
    couleur: l.couleur,
    couleurContainer: l.couleurContainer,
    couleurOnContainer: l.couleurOnContainer,
    icone: l.icone,
    capacite: l.capacite,
    chambres: l.chambres,
    description: l.description,
    equipements: l.equipements.map((e) => ({ icone: e.icone, label: e.label })),
    photos: l.photos.map((p) => p.url),
    videoUrl: l.videoUrl ?? undefined,
    lienUrl: l.lienUrl ?? undefined,
    lienLabel: l.lienLabel ?? undefined,
  };
}

export type LieuReglages = {
  id: string;
  nom: string;
  googleCalendarId: string | null;
  videoUrl: string | null;
  lienUrl: string | null;
  lienLabel: string | null;
  equipements: { id: number; icone: string; label: string }[];
  photos: { id: number; url: string }[];
};

export async function getLieuxReglages(): Promise<LieuReglages[]> {
  const rows = await prisma.lieu.findMany({
    orderBy: { nom: "asc" },
    include: {
      equipements: { orderBy: { ordre: "asc" } },
      photos: { orderBy: { ordre: "asc" } },
    },
  });
  return rows.map((l) => ({
    id: l.id,
    nom: l.nom,
    googleCalendarId: l.googleCalendarId,
    videoUrl: l.videoUrl,
    lienUrl: l.lienUrl,
    lienLabel: l.lienLabel,
    equipements: l.equipements.map((e) => ({ id: e.id, icone: e.icone, label: e.label })),
    photos: l.photos.map((p) => ({ id: p.id, url: p.url })),
  }));
}

export async function getFoyers(): Promise<Foyer[]> {
  const rows = await prisma.foyer.findMany({ orderBy: { nom: "asc" } });
  return rows.map((f) => ({ id: f.id, nom: f.nom, initiales: f.initiales, couleur: f.couleur }));
}

// Le layout (app) et la page rendue appellent chacun getFoyerConnecte() dans la même
// requête : cache() déduplique pour n'exécuter la requête Turso qu'une seule fois.
export const getFoyerConnecte = cache(async (): Promise<Foyer> => {
  const foyerId = await getFoyerIdConnecte();
  if (!foyerId) redirect("/qui-es-tu");

  const f = await prisma.foyer.findUnique({ where: { id: foyerId } });
  if (!f) redirect("/qui-es-tu");

  return { id: f.id, nom: f.nom, initiales: f.initiales, couleur: f.couleur };
});

/** Date de création du séjour le plus récent, pour détecter une activité depuis la dernière visite. */
export async function getDerniereActivite(): Promise<Date | null> {
  const { _max } = await prisma.sejour.aggregate({ _max: { creeLe: true } });
  return _max.creeLe;
}

export async function getSejours(): Promise<Sejour[]> {
  const rows = await prisma.sejour.findMany({ orderBy: { debut: "asc" } });
  return rows.map((s) => ({
    id: s.id,
    lieuId: s.lieuId,
    foyerId: s.foyerId ?? undefined,
    debut: isoOf(s.debut),
    fin: isoOf(s.fin),
    personnes: s.personnes ?? undefined,
    statut: s.statut,
    note: s.note ?? undefined,
    titreGoogle: s.titreBrut ?? undefined,
  }));
}
