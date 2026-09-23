import { redirect } from "next/navigation";
import { getMembres } from "@/lib/queries";
import { getMembreIdConnecte } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { QuiEsTuClient } from "@/components/QuiEsTuClient";

export default async function QuiEsTuPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  // On ne redirige que si le cookie désigne un membre qui existe encore (sinon boucle avec le layout).
  const id = await getMembreIdConnecte();
  if (id && (await prisma.membre.findUnique({ where: { id }, select: { id: true } }))) redirect("/semaine");
  const [membres, params] = await Promise.all([getMembres(), searchParams]);
  return <QuiEsTuClient membres={membres} erreur={params.erreur} />;
}
