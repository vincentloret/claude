import { cookies } from "next/headers";

export const FOYER_COOKIE = "kikela_foyer_id";
export const DERNIERE_VISITE_COOKIE = "kikela_derniere_visite";

/** Foyer identifié sur cet appareil (cookie posé via /qui-es-tu), ou null si aucun. */
export async function getFoyerIdConnecte(): Promise<string | null> {
  const store = await cookies();
  return store.get(FOYER_COOKIE)?.value ?? null;
}

/** Date de la dernière visite du planning sur cet appareil, ou null si jamais mesurée. */
export async function getDerniereVisite(): Promise<Date | null> {
  const store = await cookies();
  const valeur = store.get(DERNIERE_VISITE_COOKIE)?.value;
  if (!valeur) return null;
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? null : date;
}
