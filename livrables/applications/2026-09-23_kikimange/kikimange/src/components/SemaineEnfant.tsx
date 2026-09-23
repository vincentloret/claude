"use client";

import { useMemo, useState, useTransition } from "react";
import { Icon } from "./Icon";
import { Slot, type SlotAffichage } from "./Slot";
import { ParticipationSheet } from "./ParticipationSheet";
import { Confirmation } from "./Confirmation";
import { EnTeteSemaine } from "./EnTeteSemaine";
import { enregistrerSemaine, neVientPasCetteSemaine } from "@/lib/actions";
import { aujourdhui, cleCreneau, CRENEAUX, jourCourt, momentFamilier, numeroJour, type Creneau } from "@/lib/jours";
import { couvertsParticipation } from "@/lib/couverts";
import type { AccompagnantVue, CreneauVue, MembreVue, SaisieParticipation, SemaineVue } from "@/lib/types";

type Props = {
  semaine: SemaineVue;
  moi: MembreVue;
  accompagnants: (AccompagnantVue & { archive: boolean })[];
  plats: { id: string; nom: string }[];
};

function saisieDepuis(c: CreneauVue, moiId: string): SaisieParticipation | null {
  const p = c.participations.find((x) => x.membre.id === moiId);
  if (!p) return null;
  return {
    date: c.date,
    creneau: c.creneau,
    accompagnantIds: p.accompagnants.map((a) => a.id),
    supplementaires: p.supplementaires,
    partsAEmporter: p.partsAEmporter,
    platFavoriId: p.plat?.id ?? null,
    envies: p.envies ?? "",
    commentaire: p.commentaire ?? "",
  };
}

/** « Macéo et Pablo » */
function listeNoms(noms: string[]): string {
  if (noms.length <= 1) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

export function SemaineEnfant({ semaine, moi, accompagnants: accompagnantsInitiaux, plats }: Props) {
  const initial = useMemo(() => {
    const r: Record<string, SaisieParticipation> = {};
    for (const [cle, c] of Object.entries(semaine.creneaux)) {
      const s = saisieDepuis(c, moi.id);
      if (s) r[cle] = s;
    }
    return r;
  }, [semaine, moi.id]);

  const [brouillon, setBrouillon] = useState<Record<string, SaisieParticipation>>(initial);
  const [accompagnants, setAccompagnants] = useState(accompagnantsInitiaux);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<SaisieParticipation[] | null>(null);
  const [confirmerAbsence, setConfirmerAbsence] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const auj = aujourdhui();
  const maReponse = semaine.reponses.find((r) => r.membreId === moi.id);
  const modifie = JSON.stringify(Object.keys(brouillon).sort().map((k) => brouillon[k])) !== JSON.stringify(Object.keys(initial).sort().map((k) => initial[k]));
  const mesRepas = Object.values(brouillon).sort((a, b) => (a.date + a.creneau).localeCompare(b.date + b.creneau));
  const nomsAccompagnants = (ids: string[]) => accompagnants.filter((a) => ids.includes(a.id)).map((a) => a.nom);

  function affichage(c: CreneauVue): SlotAffichage {
    const cle = cleCreneau(c.date, c.creneau);
    const miens = c.participations.find((p) => p.membre.id === moi.id);
    const autresParticipations = c.participations.filter((p) => p.membre.id !== moi.id);
    const saisie = brouillon[cle];
    const couvertsMoiServeur = miens ? couvertsParticipation(miens) : 0;
    const couvertsMoiBrouillon = saisie ? 1 + saisie.accompagnantIds.length + saisie.supplementaires : 0;
    const presents = [...(saisie ? [moi] : []), ...autresParticipations.map((p) => p.membre)];
    const autres =
      (saisie ? saisie.accompagnantIds.length + saisie.supplementaires : 0) +
      autresParticipations.reduce((s, p) => s + p.accompagnants.length + p.supplementaires, 0) +
      c.invites.reduce((s, i) => s + i.nombre, 0);
    return {
      creneau: c.creneau,
      presents,
      autres,
      couverts: c.couverts - couvertsMoiServeur + couvertsMoiBrouillon,
      couvertsParents: c.couvertsParents,
      parentsAbsents: c.parentsAbsents,
      ouvert: c.ouvert,
      menuAnnonce: c.menuAnnonce,
      moi: !!saisie,
      passe: c.date < auj,
      periode: !!miens?.periode && !!saisie,
    };
  }

  // Retrouvailles : les créneaux où je viens et où au moins un frère ou une sœur vient aussi.
  const retrouvailles = mesRepas
    .map((s) => {
      const c = semaine.creneaux[cleCreneau(s.date, s.creneau)];
      const autres = c.participations.filter((p) => p.membre.id !== moi.id && p.membre.role === "enfant").map((p) => p.membre.nom);
      return autres.length ? `${listeNoms(autres)} et toi ${momentFamilier(s.date, s.creneau)}` : null;
    })
    .filter(Boolean) as string[];

  const repasOuverts = Object.values(semaine.creneaux).filter((c) => c.ouvert && c.date >= auj);

  function ouvrir(date: string, creneau: Creneau) {
    setErreur(null);
    setOuvert(cleCreneau(date, creneau));
  }

  function valider() {
    setErreur(null);
    const saisies = Object.values(brouillon);
    startTransition(async () => {
      try {
        await enregistrerSemaine(semaine.lundi, saisies);
        setConfirmation(mesRepas);
      } catch {
        setErreur("L'enregistrement n'a pas marché. Vérifie ta connexion et réessaie.");
      }
    });
  }

  function neVientPas() {
    setErreur(null);
    startTransition(async () => {
      try {
        await neVientPasCetteSemaine(semaine.lundi);
        setBrouillon((b) => Object.fromEntries(Object.entries(b).filter(([, s]) => s.date < auj)));
        setConfirmerAbsence(false);
      } catch {
        setErreur("L'enregistrement n'a pas marché. Vérifie ta connexion et réessaie.");
      }
    });
  }

  if (confirmation) {
    return (
      <Confirmation
        prenom={moi.nom}
        repas={confirmation}
        creneaux={semaine.creneaux}
        moiId={moi.id}
        nomsAccompagnants={nomsAccompagnants}
        retrouvailles={retrouvailles}
        onRetour={() => setConfirmation(null)}
      />
    );
  }

  const cleOuverte = ouvert ? semaine.creneaux[ouvert] : null;
  const autresSurCreneauOuvert = cleOuverte?.participations.filter((p) => p.membre.id !== moi.id) ?? [];
  const sousTitre = autresSurCreneauOuvert.length
    ? `Avec ${listeNoms(autresSurCreneauOuvert.map((p) => p.membre.nom))} · ${cleOuverte ? affichage(cleOuverte).couverts : 0} couverts`
    : "Personne pour l'instant";

  const sousTitreSemaine = maReponse?.neVientPas
    ? "Tu as dit que tu ne venais pas"
    : mesRepas.length
      ? `${mesRepas.length} repas pour toi${maReponse && !modifie ? " · semaine validée" : ""}`
      : "Tu viens quand cette semaine ?";

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pt-3 md:px-8 md:pt-6">
      <EnTeteSemaine lundi={semaine.lundi} sousTitre={sousTitreSemaine} />

      {(repasOuverts.length > 0 || retrouvailles.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {repasOuverts.map((c) => {
            const cle = cleCreneau(c.date, c.creneau);
            const jeViens = !!brouillon[cle];
            return (
              <div key={cle} className="flex items-center gap-3 rounded-[28px] bg-tertiary-container px-4 py-3.5 text-on-tertiary-container">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-tertiary text-white">
                  <Icon name="restaurant" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium first-letter:uppercase">
                    {momentFamilier(c.date, c.creneau)} : {c.menuAnnonce ?? "repas ouvert"}, qui vient ?
                  </div>
                  <div className="text-sm opacity-90">
                    {c.participations.length} réponse{c.participations.length > 1 ? "s" : ""}
                    {c.heure ? ` · ${c.heure}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => ouvrir(c.date, c.creneau)}
                  disabled={isPending}
                  className={`flex h-10 flex-none items-center gap-1 rounded-full px-4 text-sm font-medium ${jeViens ? "bg-tertiary text-white" : "border border-tertiary text-tertiary"}`}
                >
                  {jeViens && <Icon name="check_circle" size={18} filled />}
                  {jeViens ? "Tu viens" : "Je viens"}
                </button>
              </div>
            );
          })}
          {retrouvailles.length > 0 && (
            <div className="flex items-center gap-3 rounded-[28px] bg-secondary-container px-4 py-3.5 text-on-secondary-container">
              <Icon name="celebration" />
              <span>{retrouvailles.slice(0, 2).join(", ")} 🎉</span>
            </div>
          )}
        </div>
      )}

      {!maReponse?.neVientPas && mesRepas.every((s) => s.date < auj) && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {!confirmerAbsence ? (
            <button
              onClick={() => setConfirmerAbsence(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-outline px-5 font-medium text-primary md:self-start"
            >
              <Icon name="event_busy" size={20} />
              Je ne viens pas cette semaine
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface-container px-4 py-3">
              <span className="text-sm">Tu confirmes ? {`Papa et Maman seront prévenus.`}</span>
              <button onClick={() => setConfirmerAbsence(false)} className="h-10 rounded-full px-4 text-sm font-medium text-primary">
                Annuler
              </button>
              <button onClick={neVientPas} disabled={isPending} className="h-10 rounded-full bg-primary px-4 text-sm font-medium text-on-primary">
                Oui, je ne viens pas
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile : un jour par ligne, déjeuner et dîner côte à côte */}
      <div className="flex flex-col gap-2 md:hidden">
        {semaine.jours.map((jour) => (
          <div key={jour} className={`flex items-stretch gap-2 ${jour === auj ? "rounded-2xl bg-surface-container-low p-1 -m-1" : ""}`}>
            <div className="flex w-11 flex-none flex-col items-center justify-center">
              <span className="text-xs font-medium uppercase text-on-surface-variant">{jourCourt(jour)}</span>
              <span className={`text-2xl ${jour === auj ? "font-medium text-primary" : ""}`}>{numeroJour(jour)}</span>
            </div>
            {CRENEAUX.map((cr) => {
              const c = semaine.creneaux[cleCreneau(jour, cr)];
              return <Slot key={cr} slot={affichage(c)} vue="enfant" onClick={() => ouvrir(jour, cr)} ariaLabel={`${momentFamilier(jour, cr)}`} className="flex-1" />;
            })}
          </div>
        ))}
      </div>

      {/* Desktop : grille 7 × 2 */}
      <div className="hidden grid-cols-[88px_repeat(7,minmax(0,1fr))] gap-2 md:grid">
        <div />
        {semaine.jours.map((jour) => (
          <div key={jour} className="flex items-baseline gap-1.5 px-1 pb-1">
            <span className="text-xs font-medium uppercase text-on-surface-variant">{jourCourt(jour)}</span>
            <span className={`text-xl ${jour === auj ? "font-medium text-primary" : ""}`}>{numeroJour(jour)}</span>
          </div>
        ))}
        {CRENEAUX.map((cr) => (
          <div key={cr} className="contents">
            <div className="flex flex-col items-center justify-center gap-1 text-sm text-on-surface-variant">
              <Icon name={cr === "dejeuner" ? "light_mode" : "dark_mode"} className={cr === "dejeuner" ? "text-lunch" : "text-dinner"} />
              {cr === "dejeuner" ? "Déjeuner" : "Dîner"}
            </div>
            {semaine.jours.map((jour) => {
              const c = semaine.creneaux[cleCreneau(jour, cr)];
              return <Slot key={jour} slot={affichage(c)} vue="enfant" onClick={() => ouvrir(jour, cr)} ariaLabel={momentFamilier(jour, cr)} className="min-h-[120px]" />;
            })}
          </div>
        ))}
      </div>

      {erreur && (
        <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container" role="alert">
          {erreur}
        </p>
      )}

      {/* Barre d'action collée en bas, au-dessus de la navigation sur mobile */}
      <div className="sticky bottom-24 z-10 -mx-4 mt-2 flex items-center justify-end gap-3 bg-surface/95 px-4 py-3 backdrop-blur md:bottom-0 md:mx-0 md:border-t md:border-outline-variant md:px-0">
        <button
          onClick={valider}
          // Semaine vide jamais remplie : on passe par « Je ne viens pas cette semaine », pas par ce bouton.
          disabled={isPending || (!modifie && !!maReponse) || (mesRepas.length === 0 && Object.keys(initial).length === 0)}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 font-medium text-on-primary shadow-sm disabled:opacity-50 md:flex-none"
        >
          <Icon name="check" size={20} />
          {isPending ? "Enregistrement…" : `Valider ma semaine${mesRepas.length ? ` · ${mesRepas.length} repas` : ""}`}
        </button>
      </div>

      {ouvert && cleOuverte && (
        <ParticipationSheet
          key={ouvert}
          date={cleOuverte.date}
          creneau={cleOuverte.creneau}
          saisie={brouillon[ouvert] ?? null}
          sousTitre={sousTitre}
          parentsAbsents={cleOuverte.parentsAbsents}
          menuAnnonce={cleOuverte.ouvert ? cleOuverte.menuAnnonce : null}
          accompagnants={accompagnants.filter((a) => !a.archive || brouillon[ouvert]?.accompagnantIds.includes(a.id))}
          plats={plats}
          onAccompagnantCree={(a) => setAccompagnants((l) => [...l, { ...a, archive: false }])}
          onValider={(s) => {
            setBrouillon((b) => ({ ...b, [ouvert]: s }));
            setOuvert(null);
          }}
          onRetirer={() => {
            setBrouillon((b) => {
              const r = { ...b };
              delete r[ouvert];
              return r;
            });
            setOuvert(null);
          }}
          onFermer={() => setOuvert(null)}
        />
      )}
    </div>
  );
}
