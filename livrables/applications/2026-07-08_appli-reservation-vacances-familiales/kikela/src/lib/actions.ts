"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { isoOf } from "./calendar";
import {
  syncAllCalendars,
  syncLieuCalendar,
  listGoogleCalendars,
  creerEvenementGoogle,
  mettreAJourEvenementGoogle,
  supprimerEvenementGoogle,
} from "./google-calendar-sync";

type CreerSouhaitInput = {
  lieuId: string;
  foyerId: string;
  debut: string; // yyyy-mm-dd
  fin: string; // yyyy-mm-dd
  personnes: number;
  note?: string;
};

export async function creerSouhait(input: CreerSouhaitInput) {
  const sejour = await prisma.sejour.create({
    data: {
      lieuId: input.lieuId,
      foyerId: input.foyerId,
      debut: new Date(`${input.debut}T00:00:00`),
      fin: new Date(`${input.fin}T00:00:00`),
      personnes: input.personnes,
      statut: "souhait",
      note: input.note,
    },
    include: { lieu: true, foyer: true },
  });

  const googleEventId = await creerEvenementGoogle({
    lieuId: input.lieuId,
    titre: `Souhait — ${sejour.foyer?.nom ?? ""}`,
    debut: input.debut,
    fin: input.fin,
    description: input.note,
  }).catch(() => null);

  if (googleEventId) {
    await prisma.sejour.update({ where: { id: sejour.id }, data: { googleEventId } });
  }

  revalidatePath("/planning");
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${sejour.lieu.slug}`);

  return { lieuId: sejour.lieuId, debut: input.debut, fin: input.fin };
}

export async function confirmerSejour(id: string) {
  const sejour = await prisma.sejour.update({
    where: { id },
    data: { statut: "confirme" },
    include: { lieu: true, foyer: true },
  });

  const titre = sejour.foyer?.nom ?? "Réservation";
  if (sejour.googleEventId) {
    await mettreAJourEvenementGoogle(sejour.lieuId, sejour.googleEventId, titre).catch(() => {});
  } else if (sejour.foyer) {
    const googleEventId = await creerEvenementGoogle({
      lieuId: sejour.lieuId,
      titre,
      debut: isoOf(sejour.debut),
      fin: isoOf(sejour.fin),
      description: sejour.note ?? undefined,
    }).catch(() => null);
    if (googleEventId) {
      await prisma.sejour.update({ where: { id: sejour.id }, data: { googleEventId } });
    }
  }

  revalidatePath("/planning");
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${sejour.lieu.slug}`);
}

export async function annulerSejour(id: string) {
  const sejour = await prisma.sejour.delete({
    where: { id },
    include: { lieu: true },
  });

  // Un séjour créé dans Kikela (foyerId renseigné) qui a un événement Google associé est
  // supprimé des deux côtés. Un séjour importé de Google (foyerId absent) reste local à Kikela.
  if (sejour.foyerId && sejour.googleEventId) {
    await supprimerEvenementGoogle(sejour.lieuId, sejour.googleEventId).catch(() => {});
  }

  revalidatePath("/planning");
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${sejour.lieu.slug}`);
}

export async function definirCalendrierLieu(lieuId: string, googleCalendarId: string) {
  await prisma.lieu.update({
    where: { id: lieuId },
    data: { googleCalendarId: googleCalendarId || null },
  });

  if (googleCalendarId) {
    await syncLieuCalendar(lieuId);
  }

  revalidatePath("/parametres");
  revalidatePath("/planning");
  revalidatePath("/lieux");
}

export async function listerCalendriersGoogle() {
  return listGoogleCalendars();
}

export async function deconnecterGoogle() {
  await prisma.googleConnection.deleteMany({ where: { id: "singleton" } });

  revalidatePath("/parametres");
  revalidatePath("/planning");
  revalidatePath("/lieux");
}

export async function definirMediaLieu(
  lieuId: string,
  videoUrl: string,
  lienUrl: string,
  lienLabel: string
) {
  await prisma.lieu.update({
    where: { id: lieuId },
    data: { videoUrl: videoUrl || null, lienUrl: lienUrl || null, lienLabel: lienLabel || null },
  });

  const lieu = await prisma.lieu.findUniqueOrThrow({ where: { id: lieuId } });

  revalidatePath("/parametres");
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${lieu.slug}`);
}

export async function synchroniserCalendriers() {
  await syncAllCalendars();

  revalidatePath("/planning");
  revalidatePath("/lieux");
  revalidatePath("/parametres");
}
