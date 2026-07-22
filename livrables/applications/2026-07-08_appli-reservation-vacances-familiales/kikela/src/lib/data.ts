export type LieuId = string;

export type Lieu = {
  id: LieuId;
  slug: string;
  nom: string;
  region: string;
  ambiance: "montagne" | "mer";
  couleur: string;
  couleurContainer: string;
  couleurOnContainer: string;
  icone: string;
  capacite: number;
  chambres: number;
  description: string;
  equipements: { icone: string; label: string }[];
  photos: string[];
  videoUrl?: string;
  lienUrl?: string;
  lienLabel?: string;
};

export type Foyer = {
  id: string;
  nom: string;
  initiales: string;
  couleur: string;
};

export type Sejour = {
  id: string;
  lieuId: LieuId;
  foyerId?: string;
  debut: string; // ISO date (yyyy-mm-dd)
  fin: string; // ISO date (yyyy-mm-dd)
  personnes?: number;
  statut: "confirme" | "souhait";
  note?: string;
  // Titre brut de l'événement Google Calendar, utilisé en absence de foyer connu.
  titreGoogle?: string;
};

export function findLieu(lieux: Lieu[], id: string): Lieu | undefined {
  return lieux.find((l) => l.id === id || l.slug === id);
}

export function findFoyer(foyers: Foyer[], id: string): Foyer | undefined {
  return foyers.find((f) => f.id === id);
}

const moisFr = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const joursFr = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

export function formatDateCourte(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${joursFr[d.getDay()]} ${d.getDate()} ${moisFr[d.getMonth()]}`;
}

export function formatPlage(debut: string, fin: string): string {
  const d1 = new Date(debut + "T00:00:00");
  const d2 = new Date(fin + "T00:00:00");
  if (d1.getMonth() === d2.getMonth()) {
    return `${d1.getDate()} – ${d2.getDate()} ${moisFr[d2.getMonth()]}`;
  }
  return `${d1.getDate()} ${moisFr[d1.getMonth()]} – ${d2.getDate()} ${moisFr[d2.getMonth()]}`;
}

export function nomMois(anneeMois: string): string {
  const [annee, mois] = anneeMois.split("-").map(Number);
  return `${moisFr[mois - 1].replace(/^./, (c) => c.toUpperCase())} ${annee}`;
}

export function formatPlageSemaine(jours: Date[]): string {
  const debut = jours[0];
  const fin = jours[jours.length - 1];
  if (debut.getFullYear() !== fin.getFullYear()) {
    return `${debut.getDate()} ${moisFr[debut.getMonth()]} ${debut.getFullYear()} – ${fin.getDate()} ${moisFr[fin.getMonth()]} ${fin.getFullYear()}`;
  }
  if (debut.getMonth() !== fin.getMonth()) {
    return `${debut.getDate()} ${moisFr[debut.getMonth()]} – ${fin.getDate()} ${moisFr[fin.getMonth()]} ${fin.getFullYear()}`;
  }
  return `${debut.getDate()} – ${fin.getDate()} ${moisFr[fin.getMonth()]} ${fin.getFullYear()}`;
}
