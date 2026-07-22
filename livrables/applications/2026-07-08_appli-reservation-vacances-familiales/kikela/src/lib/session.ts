import { cookies } from "next/headers";

export const FOYER_COOKIE = "kikela_foyer_id";

/** Foyer identifié sur cet appareil (cookie posé via /qui-es-tu), ou null si aucun. */
export async function getFoyerIdConnecte(): Promise<string | null> {
  const store = await cookies();
  return store.get(FOYER_COOKIE)?.value ?? null;
}
