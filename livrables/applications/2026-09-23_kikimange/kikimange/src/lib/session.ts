import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const MEMBRE_COOKIE = "kikimange_membre";

/** Membre identifié sur cet appareil (cookie posé via /qui-es-tu), ou null si aucun. */
export async function getMembreIdConnecte(): Promise<string | null> {
  const store = await cookies();
  return store.get(MEMBRE_COOKIE)?.value ?? null;
}

/** À appeler en tête de toute Server Action : refuse l'exécution si l'appareil n'est pas identifié. */
export async function exigerMembre() {
  const id = await getMembreIdConnecte();
  if (!id) throw new Error("Non identifié : choisis ton prénom sur /qui-es-tu avant de continuer.");
  const membre = await prisma.membre.findUnique({ where: { id } });
  if (!membre) throw new Error("Membre inconnu.");
  return membre;
}

/** Réservé aux parents (le choix du rôle reste libre, c'est une protection contre les erreurs, pas un secret). */
export async function exigerParent() {
  const membre = await exigerMembre();
  if (membre.role !== "parent") throw new Error("Action réservée aux parents.");
  return membre;
}

/**
 * Compare le code famille saisi à celui configuré côté serveur (variable FAMILLE_CODE).
 * Si la variable n'est pas configurée, l'accès est refusé par défaut.
 */
export function verifierCodeFamille(code: unknown): boolean {
  const attendu = process.env.FAMILLE_CODE;
  if (!attendu) return false;
  return typeof code === "string" && code.trim() === attendu;
}
