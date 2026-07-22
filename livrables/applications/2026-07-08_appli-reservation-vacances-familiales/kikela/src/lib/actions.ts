"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { syncAllCalendars, syncLieuCalendar, listGoogleCalendars } from "./google-calendar-sync";

type CreerSouhaitInput = {
  lieuId: string;
  foyerId: string;
  debut: string; // yyyy-mm-dd
  fin: string; // yyyy-mm-dd
  personnes: number;
  note?: string;
};

export async function creerSouhait(input: CreerSouhaitInput) {
  const lieu = await prisma.sejour.create({
    data: {
      lieuId: input.lieuId,
      foyerId: input.foyerId,
      debut: new Date(`${input.debut}T00:00:00`),
      fin: new Date(`${input.fin}T00:00:00`),
      personnes: input.personnes,
      statut: "souhait",
      note: input.note,
    },
    include: { lieu: true },
  });

  revalidatePath("/planning");
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${lieu.lieu.slug}`);

  return { lieuId: lieu.lieuId, debut: input.debut, fin: input.fin };
}

export async function confirmerSejour(id: string) {
  const sejour = await prisma.sejour.update({
    where: { id },
    data: { statut: "confirme" },
    include: { lieu: true },
  });

  revalidatePath("/planning");
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${sejour.lieu.slug}`);
}

export async function annulerSejour(id: string) {
  const sejour = await prisma.sejour.delete({
    where: { id },
    include: { lieu: true },
  });

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
