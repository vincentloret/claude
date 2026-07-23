import { getLieux, getFoyers, getSejours, getFoyerConnecte, getDerniereActivite } from "@/lib/queries";
import { getDerniereVisite } from "@/lib/session";
import { PlanningClient } from "./PlanningClient";

export default async function PlanningPage() {
  const [lieux, foyers, sejours, foyerConnecte, derniereActivite, derniereVisite] = await Promise.all([
    getLieux(),
    getFoyers(),
    getSejours(),
    getFoyerConnecte(),
    getDerniereActivite(),
    getDerniereVisite(),
  ]);

  const nouveaute = !!derniereActivite && (!derniereVisite || derniereActivite > derniereVisite);

  return (
    <PlanningClient
      lieux={lieux}
      foyers={foyers}
      sejours={sejours}
      foyerConnecteId={foyerConnecte.id}
      nouveaute={nouveaute}
    />
  );
}
