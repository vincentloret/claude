import { getAccompagnants, getMembreConnecte } from "@/lib/queries";
import { AccompagnantsClient } from "@/components/AccompagnantsClient";

export default async function AccompagnantsPage() {
  const membre = await getMembreConnecte();
  const accompagnants = await getAccompagnants(membre.id);
  return <AccompagnantsClient accompagnants={accompagnants} />;
}
