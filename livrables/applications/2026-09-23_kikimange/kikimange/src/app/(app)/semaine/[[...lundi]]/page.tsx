import { notFound, redirect } from "next/navigation";
import { getAccompagnants, getMembreConnecte, getPlatsFavoris, getSemaine } from "@/lib/queries";
import { aujourdhui, estIsoValide, lundiDe } from "@/lib/jours";
import { SemaineEnfant } from "@/components/SemaineEnfant";
import { SemaineParent } from "@/components/SemaineParent";

export default async function SemainePage({ params }: { params: Promise<{ lundi?: string[] }> }) {
  const { lundi: segments } = await params;
  if (segments && segments.length > 1) notFound();
  const demande = segments?.[0];
  if (demande !== undefined && !estIsoValide(demande)) notFound();
  if (demande && lundiDe(demande) !== demande) redirect(`/semaine/${lundiDe(demande)}`);
  const lundi = demande ?? lundiDe(aujourdhui());

  const membre = await getMembreConnecte();
  const semaine = await getSemaine(lundi);

  if (membre.role === "parent") {
    return <SemaineParent semaine={semaine} />;
  }

  const [accompagnants, plats] = await Promise.all([getAccompagnants(membre.id), getPlatsFavoris()]);
  return <SemaineEnfant key={lundi} semaine={semaine} moi={membre} accompagnants={accompagnants} plats={plats} />;
}
