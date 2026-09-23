import { getMembreConnecte } from "@/lib/queries";
import { InstallerClient } from "@/components/InstallerClient";

export default async function InstallerPage() {
  const membre = await getMembreConnecte();
  return <InstallerClient prenom={membre.nom} />;
}
