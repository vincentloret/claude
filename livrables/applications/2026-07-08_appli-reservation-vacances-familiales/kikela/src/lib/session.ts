import { cookies } from "next/headers";

export const FOYER_COOKIE = "kikela_foyer_id";
export const DERNIERE_VISITE_COOKIE = "kikela_derniere_visite";

/** Foyer identifié sur cet appareil (cookie posé via /qui-es-tu), ou null si aucun. */
export async function getFoyerIdConnecte(): Promise<string | null> {
  const store = await cookies();
  return store.get(FOYER_COOKIE)?.value ?? null;
}

/** À appeler en tête de toute Server Action sensible : refuse l'exécution si l'appareil n'a jamais été identifié. */
export async function exigerFoyerConnecte(): Promise<string> {
  const foyerId = await getFoyerIdConnecte();
  if (!foyerId) throw new Error("Non identifié : choisis ton foyer sur /qui-es-tu avant de continuer.");
  return foyerId;
}

/**
 * Compare le code famille saisi à celui configuré côté serveur (variable d'environnement FOYER_CODE).
 * Si la variable n'est pas configurée, l'accès est refusé par défaut (sécurisé par défaut).
 */
export function verifierCodeFamille(code: unknown): boolean {
  const attendu = process.env.FOYER_CODE;
  if (!attendu) return false;
  return typeof code === "string" && code.trim() === attendu;
}

/** Date de la dernière visite du planning sur cet appareil, ou null si jamais mesurée. */
export async function getDerniereVisite(): Promise<Date | null> {
  const store = await cookies();
  const valeur = store.get(DERNIERE_VISITE_COOKIE)?.value;
  if (!valeur) return null;
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? null : date;
}
