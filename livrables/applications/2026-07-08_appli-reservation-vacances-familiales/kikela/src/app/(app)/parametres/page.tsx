import { getLieuxReglages, getFoyers } from "@/lib/queries";
import { getGoogleConnection } from "@/lib/google-auth";
import { ParametresClient } from "@/components/ParametresClient";

export default async function ParametresPage() {
  const [lieux, foyers, connexion] = await Promise.all([
    getLieuxReglages(),
    getFoyers(),
    getGoogleConnection(),
  ]);

  return <ParametresClient lieux={lieux} foyers={foyers} emailConnecte={connexion?.email ?? null} />;
}
