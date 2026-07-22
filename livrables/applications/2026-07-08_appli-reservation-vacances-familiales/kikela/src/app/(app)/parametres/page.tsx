import { getLieuxReglages } from "@/lib/queries";
import { getGoogleConnection } from "@/lib/google-auth";
import { ParametresClient } from "@/components/ParametresClient";

export default async function ParametresPage() {
  const [lieux, connexion] = await Promise.all([getLieuxReglages(), getGoogleConnection()]);

  return <ParametresClient lieux={lieux} emailConnecte={connexion?.email ?? null} />;
}
