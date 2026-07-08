import { prisma } from "./prisma";
import { CURRENT_FOYER_ID } from "./config";
import type { Lieu, Foyer, Sejour } from "./data";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

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
  };
}

export async function getFoyers(): Promise<Foyer[]> {
  const rows = await prisma.foyer.findMany({ orderBy: { nom: "asc" } });
  return rows.map((f) => ({ id: f.id, nom: f.nom, initiales: f.initiales, couleur: f.couleur }));
}

export async function getFoyerConnecte(): Promise<Foyer> {
  const f = await prisma.foyer.findUniqueOrThrow({ where: { id: CURRENT_FOYER_ID } });
  return { id: f.id, nom: f.nom, initiales: f.initiales, couleur: f.couleur };
}

export async function getSejours(): Promise<Sejour[]> {
  const rows = await prisma.sejour.findMany({ orderBy: { debut: "asc" } });
  return rows.map((s) => ({
    id: s.id,
    lieuId: s.lieuId,
    foyerId: s.foyerId,
    debut: isoDate(s.debut),
    fin: isoDate(s.fin),
    personnes: s.personnes,
    statut: s.statut,
    note: s.note ?? undefined,
  }));
}
