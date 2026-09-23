import { notFound, redirect } from "next/navigation";
import { getAccompagnants, getMembreConnecte, getPlatsFavoris, getSemaine } from "@/lib/queries";
import { aujourdhui, estIsoValide, lundiDe } from "@/lib/jours";
import { SemaineEnfant } from "@/components/SemaineEnfant";
import { SemaineParent } from "@/components/SemaineParent";

export default async function SemainePage({
  params,
  searchParams,
}: {
  params: Promise<{ lundi?: string[] }>;
  searchParams: Promise<{ periode?: string }>;
}) {
  const [{ lundi: segments }, { periode: ajoutPeriode }] = await Promise.all([params, searchParams]);
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
  // La clé change quand une période apparaît ou disparaît : l'état local repart alors des données fraîches.
  // (Pas quand la semaine est validée, sinon l'écran de confirmation disparaîtrait aussitôt.)
  const periodes = [
    ...new Set(Object.values(semaine.creneaux).flatMap((c) => c.participations.filter((p) => p.membre.id === membre.id && p.periode).map((p) => p.periode!.id))),
  ]
    .sort()
    .join(",");
  const nbAjoutes = Number(ajoutPeriode);
  return (
    <SemaineEnfant
      key={`${lundi}|${periodes}|${ajoutPeriode ?? ""}`}
      semaine={semaine}
      moi={membre}
      accompagnants={accompagnants}
      plats={plats}
      infoInitiale={Number.isInteger(nbAjoutes) && nbAjoutes >= 0 && ajoutPeriode ? `Période enregistrée : ${nbAjoutes} repas ajouté${nbAjoutes > 1 ? "s" : ""}. Pense à valider tes semaines.` : null}
    />
  );
}
