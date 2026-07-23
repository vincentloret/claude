"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { isoOf } from "./calendar";
import { FOYER_COOKIE, DERNIERE_VISITE_COOKIE } from "./session";
import {
  syncAllCalendars,
  syncLieuCalendar,
  listGoogleCalendars,
  creerEvenementGoogle,
  mettreAJourEvenementGoogle,
  supprimerEvenementGoogle,
} from "./google-calendar-sync";

export async function choisirFoyer(formData: FormData) {
  const foyerId = formData.get("foyerId");
  if (typeof foyerId !== "string") return;

  await prisma.foyer.findUniqueOrThrow({ where: { id: foyerId } });

  const store = await cookies();
  store.set(FOYER_COOKIE, foyerId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  });

  redirect("/planning");
}

export async function marquerVisite() {
  const store = await cookies();
  store.set(DERNIERE_VISITE_COOKIE, new Date().toISOString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  });
}

export async function changerFoyer() {
  const store = await cookies();
  store.delete(FOYER_COOKIE);
  redirect("/qui-es-tu");
}

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

async function revaliderLieu(lieuId: string) {
  const lieu = await prisma.lieu.findUniqueOrThrow({ where: { id: lieuId } });
  revalidatePath("/parametres");
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${lieu.slug}`);
}

export async function ajouterEquipement(lieuId: string, icone: string, label: string) {
  const dernier = await prisma.equipement.findFirst({ where: { lieuId }, orderBy: { ordre: "desc" } });
  await prisma.equipement.create({
    data: { lieuId, icone, label, ordre: (dernier?.ordre ?? -1) + 1 },
  });
  await revaliderLieu(lieuId);
}

export async function supprimerEquipement(id: number) {
  const equipement = await prisma.equipement.delete({ where: { id }, include: { lieu: true } });
  revalidatePath("/parametres");
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${equipement.lieu.slug}`);
}

export async function ajouterPhoto(lieuId: string, url: string) {
  const derniere = await prisma.lieuPhoto.findFirst({ where: { lieuId }, orderBy: { ordre: "desc" } });
  await prisma.lieuPhoto.create({
    data: { lieuId, url, ordre: (derniere?.ordre ?? -1) + 1 },
  });
  await revaliderLieu(lieuId);
}

export async function supprimerPhoto(id: number) {
  const photo = await prisma.lieuPhoto.delete({ where: { id }, include: { lieu: true } });
  revalidatePath("/parametres");
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${photo.lieu.slug}`);
}

export async function synchroniserCalendriers() {
  await syncAllCalendars();

  revalidatePath("/planning");
  revalidatePath("/lieux");
  revalidatePath("/parametres");
}
