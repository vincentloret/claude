import webpush from "web-push";
import { prisma } from "./prisma";

export type MessagePush = { titre: string; corps: string; url: string };

let configure = false;

/** Configure web-push avec les clés VAPID. Renvoie false si elles manquent (notifications désactivées). */
function configurer(): boolean {
  if (configure) return true;
  const publique = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privee = process.env.VAPID_PRIVATE_KEY;
  if (!publique || !privee) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:contact@kikimange.app", publique, privee);
  configure = true;
  return true;
}

/**
 * Envoie une notification à tous les appareils des membres indiqués.
 * Ne lève jamais d'erreur : une notification ratée ne doit pas faire échouer l'action de l'utilisateur.
 * Les abonnements expirés (404/410) sont supprimés au passage.
 */
export async function notifier(membreIds: string[], message: MessagePush): Promise<number> {
  if (membreIds.length === 0 || !configurer()) return 0;
  try {
    const abonnements = await prisma.abonnementPush.findMany({ where: { membreId: { in: membreIds } } });
    const resultats = await Promise.allSettled(
      abonnements.map((a) =>
        webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, JSON.stringify(message), { TTL: 60 * 60 * 24 })
      )
    );
    const expires = abonnements.filter((a, i) => {
      const r = resultats[i];
      return r.status === "rejected" && [404, 410].includes((r.reason as { statusCode?: number })?.statusCode ?? 0);
    });
    if (expires.length) {
      await prisma.abonnementPush.deleteMany({ where: { id: { in: expires.map((a) => a.id) } } });
    }
    return resultats.filter((r) => r.status === "fulfilled").length;
  } catch (e) {
    console.error("Notification non envoyée", e);
    return 0;
  }
}

export async function notifierParents(message: MessagePush) {
  const parents = await prisma.membre.findMany({ where: { role: "parent" }, select: { id: true } });
  return notifier(parents.map((p) => p.id), message);
}

export async function notifierEnfantsAvecRappel(message: MessagePush, sauf: string[] = []) {
  const enfants = await prisma.membre.findMany({ where: { role: "enfant", rappelActif: true, id: { notIn: sauf } }, select: { id: true } });
  return notifier(enfants.map((e) => e.id), message);
}
