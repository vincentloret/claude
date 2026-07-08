"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

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
