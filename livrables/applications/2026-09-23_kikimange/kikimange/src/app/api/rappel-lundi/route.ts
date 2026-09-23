import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifier } from "@/lib/push";
import { aujourdhui, indexJour, jourEtMois, lundiDe } from "@/lib/jours";

export const dynamic = "force-dynamic";

/** Heure qu'il est à Paris (0-23), quel que soit le fuseau du serveur. */
function heureParis(): number {
  return Number(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", hour12: false }).format(new Date()));
}

/**
 * Rappel du lundi 11 h, appelé par la fonction planifiée Netlify (netlify/functions/rappel-lundi.mts).
 * Le cron Netlify est en UTC : il appelle à 9 h et 10 h UTC, et seul l'appel qui tombe à 11 h à Paris envoie.
 * Destinataires : enfants avec le rappel activé qui n'ont pas encore répondu pour la semaine.
 * Une période ne vaut pas réponse : un enfant en stage reçoit quand même le rappel.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const forcer = request.nextUrl.searchParams.get("forcer") === "1";
  const auj = aujourdhui();
  if (!forcer && (indexJour(auj) !== 0 || heureParis() !== 11)) {
    return NextResponse.json({ envoye: false, raison: "Pas lundi 11 h à Paris" });
  }

  const lundi = lundiDe(auj);
  const enfants = await prisma.membre.findMany({
    where: { role: "enfant", rappelActif: true, reponses: { none: { lundi } } },
    select: { id: true, nom: true },
  });

  let appareils = 0;
  for (const e of enfants) {
    appareils += await notifier([e.id], {
      titre: "Ton Kikimange de la semaine",
      corps: `${e.nom}, tu viens manger quand cette semaine ? Semaine du ${jourEtMois(lundi)}.`,
      url: `/semaine/${lundi}`,
    });
  }

  return NextResponse.json({ envoye: true, enfants: enfants.map((e) => e.nom), appareils });
}
