import { google } from "googleapis";
import { prisma } from "./prisma";
import { getAuthorizedGoogleClient } from "./google-auth";

// Fenêtre de synchronisation : les séjours passés récents restent visibles, l'horizon
// couvre largement les réservations de vacances à venir.
const MOIS_PASSES = 1;
const MOIS_FUTURS = 18;

export type GoogleCalendarOption = { id: string; nom: string };

export async function listGoogleCalendars(): Promise<GoogleCalendarOption[]> {
  const client = await getAuthorizedGoogleClient();
  if (!client) return [];

  const { data } = await google.calendar({ version: "v3", auth: client }).calendarList.list();
  return (data.items ?? [])
    .filter((c) => c.id)
    .map((c) => ({ id: c.id!, nom: c.summary ?? c.id! }));
}

function dateEvenement(point?: { date?: string | null; dateTime?: string | null } | null): string | null {
  if (!point) return null;
  if (point.date) return point.date;
  if (point.dateTime) return point.dateTime.slice(0, 10);
  return null;
}

/** Synchronise les événements du calendrier Google associé à un lieu vers ses Sejour. */
export async function syncLieuCalendar(lieuId: string): Promise<{ importes: number }> {
  const lieu = await prisma.lieu.findUniqueOrThrow({ where: { id: lieuId } });
  if (!lieu.googleCalendarId) return { importes: 0 };

  const client = await getAuthorizedGoogleClient();
  if (!client) throw new Error("Aucun compte Google connecté.");

  const timeMin = new Date();
  timeMin.setMonth(timeMin.getMonth() - MOIS_PASSES);
  const timeMax = new Date();
  timeMax.setMonth(timeMax.getMonth() + MOIS_FUTURS);

  const { data } = await google.calendar({ version: "v3", auth: client }).events.list({
    calendarId: lieu.googleCalendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const evenements = (data.items ?? []).filter((e) => e.id && e.status !== "cancelled");
  const idsVus: string[] = [];

  for (const evenement of evenements) {
    const debut = dateEvenement(evenement.start);
    const fin = dateEvenement(evenement.end);
    if (!debut || !fin) continue;

    idsVus.push(evenement.id!);
    await prisma.sejour.upsert({
      where: { googleEventId: evenement.id! },
      create: {
        lieuId: lieu.id,
        debut: new Date(`${debut}T00:00:00`),
        fin: new Date(`${fin}T00:00:00`),
        statut: "confirme",
        googleEventId: evenement.id!,
        titreBrut: evenement.summary ?? "(Sans titre)",
      },
      update: {
        debut: new Date(`${debut}T00:00:00`),
        fin: new Date(`${fin}T00:00:00`),
        titreBrut: evenement.summary ?? "(Sans titre)",
      },
    });
  }

  // Répercute les suppressions/annulations côté Google sur les séjours importés du lieu.
  await prisma.sejour.deleteMany({
    where: { lieuId: lieu.id, googleEventId: { not: null, notIn: idsVus } },
  });

  return { importes: idsVus.length };
}

export async function syncAllCalendars(): Promise<void> {
  const lieux = await prisma.lieu.findMany({ where: { googleCalendarId: { not: null } } });
  for (const lieu of lieux) {
    await syncLieuCalendar(lieu.id);
  }
}
