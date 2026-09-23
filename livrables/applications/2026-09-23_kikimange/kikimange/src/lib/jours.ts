// Dates de repas en texte "AAAA-MM-JJ". Tous les calculs passent par des dates UTC à minuit,
// qui ne subissent jamais de changement d'heure : pas de décalage d'un jour possible.

export type Creneau = "dejeuner" | "diner";
export const CRENEAUX: Creneau[] = ["dejeuner", "diner"];

const JOURS_COURTS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const JOURS_LONGS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function versDate(iso: string): Date {
  const [a, m, j] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, j));
}

function versIso(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function estIsoValide(iso: unknown): iso is string {
  return typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso) && versIso(versDate(iso)) === iso;
}

/** Aujourd'hui à Paris, quel que soit le fuseau du serveur (Netlify tourne en UTC). */
export function aujourdhui(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
}

export function ajouterJours(iso: string, n: number): string {
  const d = versDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return versIso(d);
}

/** 0 = lundi … 6 = dimanche */
export function indexJour(iso: string): number {
  return (versDate(iso).getUTCDay() + 6) % 7;
}

export function lundiDe(iso: string): string {
  return ajouterJours(iso, -indexJour(iso));
}

export function joursDeLaSemaine(lundi: string): string[] {
  return Array.from({ length: 7 }, (_, i) => ajouterJours(lundi, i));
}

export function numeroJour(iso: string): number {
  return versDate(iso).getUTCDate();
}

export function jourCourt(iso: string): string {
  return JOURS_COURTS[indexJour(iso)];
}

export function jourLong(iso: string): string {
  return JOURS_LONGS[indexJour(iso)];
}

/** « 28 septembre » */
export function jourEtMois(iso: string): string {
  const d = versDate(iso);
  const jour = d.getUTCDate() === 1 ? "1er" : String(d.getUTCDate());
  return `${jour} ${MOIS[d.getUTCMonth()]}`;
}

/** « Samedi 3 » */
export function jourNomme(iso: string): string {
  return `${jourLong(iso)} ${numeroJour(iso)}`;
}

export function libelleCreneau(c: Creneau): string {
  return c === "dejeuner" ? "Déjeuner" : "Dîner";
}

/** « samedi soir », « dimanche midi » */
export function momentFamilier(iso: string, c: Creneau): string {
  return `${jourLong(iso).toLowerCase()} ${c === "dejeuner" ? "midi" : "soir"}`;
}

/** Position d'un créneau dans le temps, pour comparer des (date, créneau). */
export function rangCreneau(iso: string, c: Creneau): string {
  return `${iso}-${c === "dejeuner" ? 0 : 1}`;
}

export function cleCreneau(iso: string, c: Creneau): string {
  return `${iso}_${c}`;
}

export const DUREE_MAX_PERIODE = 120;

/** Créneaux couverts par une période (bornes incluses), dans l'ordre. jours : 1 = lundi … 7 = dimanche. */
export function creneauxDePeriode(debut: string, fin: string, dejeuner: boolean, diner: boolean, jours: number[]) {
  const liste: { date: string; creneau: Creneau }[] = [];
  for (let d = debut, n = 0; d <= fin && n <= DUREE_MAX_PERIODE; d = ajouterJours(d, 1), n++) {
    if (!jours.includes(indexJour(d) + 1)) continue;
    if (dejeuner) liste.push({ date: d, creneau: "dejeuner" });
    if (diner) liste.push({ date: d, creneau: "diner" });
  }
  return liste;
}
