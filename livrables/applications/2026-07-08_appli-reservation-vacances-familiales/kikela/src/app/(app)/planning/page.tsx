import { getLieux, getFoyers, getSejours, getFoyerConnecte } from "@/lib/queries";
import { PlanningClient } from "./PlanningClient";

export default async function PlanningPage() {
  const [lieux, foyers, sejours, foyerConnecte] = await Promise.all([
    getLieux(),
    getFoyers(),
    getSejours(),
    getFoyerConnecte(),
  ]);

  return (
    <PlanningClient lieux={lieux} foyers={foyers} sejours={sejours} foyerConnecteId={foyerConnecte.id} />
  );
}
