import { notFound, redirect } from "next/navigation";
import { getMembreConnecte, getSemaine } from "@/lib/queries";
import { aujourdhui, estIsoValide, jourNomme, libelleCreneau, lundiDe } from "@/lib/jours";
import { Icon } from "@/components/Icon";
import { EnTeteSemaine } from "@/components/EnTeteSemaine";
import { IconeCreneau } from "@/components/Slot";
import { PartagerTexte } from "@/components/PartagerTexte";
import type { CreneauVue } from "@/lib/types";

type Ligne = { icone: string; texte: string; accent?: boolean };

function lignesDuRepas(c: CreneauVue): Ligne[] {
  const lignes: Ligne[] = [];
  for (const p of c.participations) {
    if (p.plat) lignes.push({ icone: "restaurant_menu", texte: `${p.plat.nom} (idée de ${p.membre.nom})` });
  }
  for (const p of c.participations) {
    if (p.envies) lignes.push({ icone: "favorite", texte: `${p.envies} (${p.membre.nom})` });
  }
  for (const p of c.participations) {
    for (const a of p.accompagnants) if (a.remarque) lignes.push({ icone: "eco", texte: `${a.nom} : ${a.remarque}`, accent: true });
  }
  for (const i of c.invites) if (i.remarque) lignes.push({ icone: "eco", texte: `${i.nom} : ${i.remarque}`, accent: true });
  const emporter = c.participations.filter((p) => p.partsAEmporter > 0);
  if (emporter.length) {
    lignes.push({
      icone: "takeout_dining",
      texte: emporter.map((p) => `${p.partsAEmporter} part${p.partsAEmporter > 1 ? "s" : ""} à emporter (${p.membre.nom})`).join(", "),
    });
  }
  for (const p of c.participations) {
    if (p.commentaire) lignes.push({ icone: "chat_bubble", texte: `${p.membre.nom} : ${p.commentaire}` });
  }
  return lignes;
}

function qui(c: CreneauVue): string {
  const noms = c.participations.map((p) => {
    const avec = [...p.accompagnants.map((a) => a.nom), ...(p.supplementaires ? [`+${p.supplementaires}`] : [])];
    return avec.length ? `${p.membre.nom} (avec ${avec.join(", ")})` : p.membre.nom;
  });
  const invites = c.invites.map((i) => (i.nombre > 1 ? `${i.nom} (${i.nombre})` : i.nom));
  return [...noms, ...invites].join(", ");
}

export default async function CoursesPage({ params }: { params: Promise<{ lundi?: string[] }> }) {
  const membre = await getMembreConnecte();
  if (membre.role !== "parent") redirect("/semaine");

  const { lundi: segments } = await params;
  const demande = segments?.[0];
  if ((segments && segments.length > 1) || (demande !== undefined && !estIsoValide(demande))) notFound();
  if (demande && lundiDe(demande) !== demande) redirect(`/courses/${lundiDe(demande)}`);
  const lundi = demande ?? lundiDe(aujourdhui());
  const auj = aujourdhui();

  const semaine = await getSemaine(lundi);
  const creneaux = Object.values(semaine.creneaux);
  const aPreparer = creneaux.filter((c) => c.participations.length > 0 || c.invites.length > 0 || c.ouvert);
  const absents = creneaux.filter((c) => c.parentsAbsents && c.participations.length === 0 && c.invites.length === 0);
  const aDeux = creneaux.filter((c) => !aPreparer.includes(c) && !absents.includes(c));

  const totalCouverts = creneaux.reduce((s, c) => s + c.couverts, 0);
  const totalParents = creneaux.reduce((s, c) => s + c.couvertsParents, 0);
  const parts = creneaux.reduce((s, c) => s + c.participations.reduce((t, p) => t + p.partsAEmporter, 0), 0);
  const idees = creneaux.reduce((s, c) => s + c.participations.filter((p) => p.plat).length, 0);
  const regimes = new Set(
    creneaux.flatMap((c) => [...c.participations.flatMap((p) => p.accompagnants.map((a) => a.remarque)), ...c.invites.map((i) => i.remarque)]).filter(Boolean)
  );

  const texteAPartager = [
    `Courses Kikimange, semaine du ${lundi.split("-").reverse().join("/")}`,
    `${totalCouverts} couverts dont nous ${totalParents}`,
    "",
    ...aPreparer.map((c) => {
      const details = lignesDuRepas(c).map((l) => `  - ${l.texte}`);
      return [`${jourNomme(c.date)} · ${libelleCreneau(c.creneau)}${c.menuAnnonce ? ` (${c.menuAnnonce})` : ""} : ${c.couverts} couverts`, `  ${qui(c)}`, ...details].join("\n");
    }),
  ].join("\n");

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-4 px-4 pt-3 pb-8 md:px-8 md:pt-6">
      <EnTeteSemaine lundi={lundi} base="/courses" sousTitre="Courses · tout ce qu'il faut savoir pour remplir le frigo" actions={<PartagerTexte texte={texteAPartager} />} />

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Totaux de la semaine">
        {[
          { v: totalCouverts, l: `couverts, dont vous ${totalParents}`, fort: true },
          { v: aPreparer.length, l: "repas avec les enfants ou invités" },
          { v: parts, l: "parts à emporter" },
          { v: idees, l: "idées de menu" },
          { v: regimes.size, l: regimes.size ? `régime : ${[...regimes].join(", ").toLowerCase()}` : "régime particulier" },
        ].map((s) => (
          <div key={s.l} className={`rounded-2xl px-3 py-2.5 ${s.fort ? "bg-primary-container text-on-primary-container" : "bg-surface-container-low"}`}>
            <div className="text-2xl tabular-nums">{s.v}</div>
            <div className={`text-xs ${s.fort ? "" : "text-on-surface-variant"}`}>{s.l}</div>
          </div>
        ))}
      </section>

      {aPreparer.length === 0 && (
        <p className="rounded-2xl bg-surface-container-low px-4 py-6 text-center text-on-surface-variant">Aucun enfant ni invité cette semaine pour l&apos;instant.</p>
      )}

      <ul className="flex flex-col gap-2">
        {aPreparer.map((c) => {
          const lignes = lignesDuRepas(c);
          return (
            <li key={`${c.date}_${c.creneau}`} className={`rounded-2xl px-4 py-3 ${c.ouvert ? "bg-tertiary-container/60 ring-1 ring-tertiary" : "bg-surface-container-low"} ${c.date < auj ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-7 flex-none items-center gap-1 rounded-lg px-2 text-xs font-medium ${c.creneau === "dejeuner" ? "bg-lunch-container text-lunch" : "bg-dinner-container text-dinner"}`}>
                  <IconeCreneau creneau={c.creneau} size={16} />
                  {c.creneau === "dejeuner" ? "Déj." : "Dîner"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {jourNomme(c.date)}
                    {c.menuAnnonce ? ` · ${c.menuAnnonce.toLowerCase()}` : ""}
                  </div>
                  <div className="text-sm text-on-surface-variant">{qui(c) || "Personne pour l'instant"}</div>
                </div>
                <div className="flex-none text-right">
                  <span className="text-2xl tabular-nums">{c.couverts}</span>
                  <span className="ml-1 text-xs text-on-surface-variant">couv.</span>
                </div>
              </div>
              {lignes.length > 0 && (
                <ul className="mt-2 space-y-1 pl-1 text-sm">
                  {lignes.map((l, i) => (
                    <li key={i} className={`flex items-start gap-2 ${l.accent ? "font-medium text-on-tertiary-container" : ""}`}>
                      <Icon name={l.icone} size={18} className="mt-0.5 flex-none text-on-surface-variant" />
                      {l.texte}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        {absents.map((c) => (
          <li key={`${c.date}_${c.creneau}`} className="hachures flex items-center gap-3 rounded-2xl px-4 py-3 text-away">
            <Icon name="flight_takeoff" />
            <span className="flex-1">
              {jourNomme(c.date)} · {libelleCreneau(c.creneau).toLowerCase()} : vous êtes absents, rien à prévoir
            </span>
          </li>
        ))}
      </ul>

      {aDeux.length > 0 && (
        <p className="flex items-center gap-2 rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
          <Icon name="restaurant" size={18} />
          {aDeux.length} repas à deux, vous seulement.
        </p>
      )}
    </div>
  );
}
