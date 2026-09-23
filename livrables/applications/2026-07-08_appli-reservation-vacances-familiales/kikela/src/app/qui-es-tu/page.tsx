import { redirect } from "next/navigation";
import { getFoyers } from "@/lib/queries";
import { getFoyerIdConnecte } from "@/lib/session";
import { QuiEsTuClient } from "@/components/QuiEsTuClient";

export default async function QuiEsTuPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const foyerId = await getFoyerIdConnecte();
  if (foyerId) redirect("/planning");

  const [foyers, params] = await Promise.all([getFoyers(), searchParams]);

  return <QuiEsTuClient foyers={foyers} erreur={params.erreur} />;
}
