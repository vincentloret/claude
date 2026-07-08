import { notFound } from "next/navigation";
import { getLieuBySlug, getLieux, getFoyers, getSejours, getFoyerConnecte } from "@/lib/queries";
import { LieuDetail } from "@/components/LieuDetail";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LieuPage({ params }: Props) {
  const { slug } = await params;
  const [lieu, lieux, foyers, sejours, foyerConnecte] = await Promise.all([
    getLieuBySlug(slug),
    getLieux(),
    getFoyers(),
    getSejours(),
    getFoyerConnecte(),
  ]);
  if (!lieu) notFound();

  return (
    <LieuDetail
      lieu={lieu}
      lieux={lieux}
      foyers={foyers}
      sejours={sejours}
      foyerConnecteId={foyerConnecte.id}
    />
  );
}
