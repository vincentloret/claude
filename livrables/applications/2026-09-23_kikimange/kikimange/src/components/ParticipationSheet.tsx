"use client";

import { useEffect, useState, useTransition } from "react";
import { Icon } from "./Icon";
import { IconeCreneau } from "./Slot";
import { ajouterAccompagnant } from "@/lib/actions";
import { jourNomme, libelleCreneau, momentFamilier, type Creneau } from "@/lib/jours";
import { PARENTS_LIBELLE } from "@/lib/couverts";
import type { AccompagnantVue, SaisieParticipation } from "@/lib/types";

export const REMARQUES_PRETES = ["Végétarien·ne", "Sans gluten", "Sans lactose", "Allergie…"];

type Props = {
  date: string;
  creneau: Creneau;
  saisie: SaisieParticipation | null; // null : l'enfant ne vient pas encore
  sousTitre: string;
  parentsAbsents: boolean;
  menuAnnonce: string | null;
  accompagnants: AccompagnantVue[]; // non archivés, plus ceux déjà choisis pour ce repas
  plats: { id: string; nom: string }[];
  onAccompagnantCree: (a: AccompagnantVue) => void;
  onValider: (s: SaisieParticipation) => void;
  onRetirer: () => void;
  onFermer: () => void;
};

export function Stepper({ label, aide, valeur, onChange, id }: { label: string; aide: string; valeur: number; onChange: (n: number) => void; id: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        <div id={id} className="text-[15px]">{label}</div>
        <div className="text-xs text-on-surface-variant">{aide}</div>
      </div>
      <div className="flex items-center gap-2" role="group" aria-labelledby={id}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, valeur - 1))}
          disabled={valeur === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-outline text-primary disabled:opacity-40"
          aria-label={`Moins (${label})`}
        >
          <Icon name="remove" />
        </button>
        <span className="w-6 text-center text-lg tabular-nums" aria-live="polite">{valeur}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, valeur + 1))}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-outline text-primary"
          aria-label={`Plus (${label})`}
        >
          <Icon name="add" />
        </button>
      </div>
    </div>
  );
}

function ChampTexte({ id, label, valeur, onChange, placeholder }: { id: string; label: string; valeur: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label htmlFor={id} className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
      <span className="block text-xs text-on-surface-variant">{label}</span>
      <input
        id={id}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={200}
        className="w-full bg-transparent text-[15px] outline-none placeholder:text-outline"
      />
    </label>
  );
}

export function ParticipationSheet(props: Props) {
  const { date, creneau, saisie, sousTitre, parentsAbsents, menuAnnonce, accompagnants, plats } = props;
  const dejaInscrit = saisie !== null;

  const [accompagnantIds, setAccompagnantIds] = useState<string[]>(saisie?.accompagnantIds ?? []);
  const [supplementaires, setSupplementaires] = useState(saisie?.supplementaires ?? 0);
  const [partsAEmporter, setPartsAEmporter] = useState(saisie?.partsAEmporter ?? 0);
  const [platFavoriId, setPlatFavoriId] = useState<string | null>(saisie?.platFavoriId ?? null);
  const [envies, setEnvies] = useState(saisie?.envies ?? "");
  const [commentaire, setCommentaire] = useState(saisie?.commentaire ?? "");
  const [details, setDetails] = useState(
    dejaInscrit && (saisie.supplementaires > 0 || saisie.partsAEmporter > 0 || !!saisie.platFavoriId || !!saisie.envies || !!saisie.commentaire)
  );

  const [ajout, setAjout] = useState(false);
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouvelleRemarque, setNouvelleRemarque] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function touche(e: KeyboardEvent) {
      if (e.key === "Escape") props.onFermer();
    }
    document.addEventListener("keydown", touche);
    return () => document.removeEventListener("keydown", touche);
  }, [props]);

  function basculer(id: string) {
    setAccompagnantIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function creerAccompagnant() {
    if (!nouveauNom.trim()) return;
    setErreur(null);
    startTransition(async () => {
      try {
        const a = await ajouterAccompagnant(nouveauNom, nouvelleRemarque);
        props.onAccompagnantCree(a);
        setAccompagnantIds((ids) => [...ids, a.id]);
        setNouveauNom("");
        setNouvelleRemarque("");
        setAjout(false);
      } catch {
        setErreur("Impossible d'ajouter cette personne. Réessaie.");
      }
    });
  }

  function valider() {
    props.onValider({ date, creneau, accompagnantIds, supplementaires, partsAEmporter, platFavoriId, envies, commentaire });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end" role="dialog" aria-modal="true" aria-labelledby="titre-feuille">
      <button className="absolute inset-0 bg-black/30" onClick={props.onFermer} aria-label="Fermer" tabIndex={-1} />
      <div className="animate-sheet relative flex max-h-[92vh] w-full flex-col rounded-t-[28px] bg-surface-container-low shadow-xl md:h-full md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-[28px]">
        <div className="mx-auto mt-3 h-1 w-8 rounded-full bg-outline/40 md:hidden" />

        <div className="flex items-start gap-3 px-6 pt-4 pb-3 md:pt-6">
          <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${creneau === "dejeuner" ? "bg-lunch-container" : "bg-dinner-container"}`}>
            <IconeCreneau creneau={creneau} size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="titre-feuille" className="text-[22px] leading-7">
              {jourNomme(date)} · {libelleCreneau(creneau)}
            </h2>
            <p className="text-sm text-on-surface-variant">{sousTitre}</p>
          </div>
          <button onClick={props.onFermer} className="flex h-12 w-12 flex-none items-center justify-center rounded-full hover:bg-surface-container-high" aria-label="Fermer">
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-4">
          {menuAnnonce && (
            <div className="flex items-center gap-3 rounded-2xl bg-tertiary-container px-4 py-3 text-on-tertiary-container">
              <Icon name="restaurant" />
              <span>
                Au menu : <strong className="font-medium">{menuAnnonce}</strong>
              </span>
            </div>
          )}
          {parentsAbsents && (
            <div className="hachures flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-away">
              <Icon name="flight_takeoff" />
              <span>
                <strong className="font-medium">{PARENTS_LIBELLE} seront absents</strong>, tu pourras te servir. Le frigo est à toi !
              </span>
            </div>
          )}

          <section>
            <h3 className="mb-2 text-sm font-medium">Accompagnants</h3>
            <div className="flex flex-wrap gap-2">
              {accompagnants.map((a) => {
                const actif = accompagnantIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => basculer(a.id)}
                    aria-pressed={actif}
                    className={`flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm ${
                      actif ? "bg-secondary-container text-on-secondary-container" : "border border-outline text-on-surface-variant"
                    }`}
                  >
                    {actif && <Icon name="check" size={18} />}
                    {a.nom}
                    {a.remarque && <span className="text-xs opacity-80">{a.remarque.toLowerCase()}</span>}
                  </button>
                );
              })}
              {!ajout && (
                <button
                  type="button"
                  onClick={() => setAjout(true)}
                  className="flex h-10 items-center gap-1.5 rounded-lg border border-outline px-3 text-sm font-medium text-primary"
                >
                  <Icon name="person_add" size={18} />
                  Ajouter quelqu&apos;un
                </button>
              )}
            </div>
            {ajout && (
              <div className="mt-3 space-y-2 rounded-2xl bg-surface-container p-3">
                <ChampTexte id="nouveau-nom" label="Prénom" valeur={nouveauNom} onChange={setNouveauNom} placeholder="Ex. : Hugo" />
                <div className="flex flex-wrap gap-1.5">
                  {REMARQUES_PRETES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNouvelleRemarque(r === "Allergie…" ? "Allergie : " : r)}
                      className={`h-8 rounded-lg px-2.5 text-xs ${nouvelleRemarque === r ? "bg-secondary-container text-on-secondary-container" : "border border-outline text-on-surface-variant"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <ChampTexte id="nouvelle-remarque" label="Remarque (facultatif)" valeur={nouvelleRemarque} onChange={setNouvelleRemarque} placeholder="Ex. : végétarien" />
                {erreur && <p className="text-sm text-error">{erreur}</p>}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setAjout(false)} className="h-10 rounded-full px-4 text-sm font-medium text-primary">
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={creerAccompagnant}
                    disabled={isPending || !nouveauNom.trim()}
                    className="h-10 rounded-full bg-primary px-4 text-sm font-medium text-on-primary disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant">Enregistré dans tes accompagnants pour la prochaine fois.</p>
              </div>
            )}
          </section>

          {!details ? (
            <button type="button" onClick={() => setDetails(true)} className="flex h-10 items-center gap-1 text-sm font-medium text-primary">
              Plus de détails : en plus, à emporter, menu, envies
              <Icon name="expand_more" size={20} />
            </button>
          ) : (
            <section className="space-y-3">
              <Stepper id="st-plus" label="Personnes en plus" aide="Sans nom, ex. un ami de passage" valeur={supplementaires} onChange={setSupplementaires} />
              <Stepper id="st-emporter" label="Parts à emporter" aide="Pour le lendemain" valeur={partsAEmporter} onChange={setPartsAEmporter} />
              <label htmlFor="idee-menu" className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary">
                <span className="block text-xs text-on-surface-variant">Idée de menu</span>
                <select
                  id="idee-menu"
                  value={platFavoriId ?? ""}
                  onChange={(e) => setPlatFavoriId(e.target.value || null)}
                  className="w-full bg-transparent py-0.5 text-[15px] outline-none"
                >
                  <option value="">Choisis un plat (facultatif)</option>
                  {plats.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
                </select>
              </label>
              <ChampTexte id="envies" label="Envies" valeur={envies} onChange={setEnvies} placeholder="Ex. : une soupe, il commence à faire froid" />
              <ChampTexte id="commentaire" label="Commentaire" valeur={commentaire} onChange={setCommentaire} placeholder="Ex. : j'arrive vers 20 h" />
            </section>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-outline-variant px-6 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          {dejaInscrit ? (
            <>
              <button type="button" onClick={props.onRetirer} className="flex h-12 items-center gap-1.5 rounded-full px-3 font-medium text-error">
                <Icon name="event_busy" size={20} />
                Je ne viens plus
              </button>
              <button type="button" onClick={valider} className="ml-auto h-12 rounded-full bg-primary px-6 font-medium text-on-primary">
                Enregistrer
              </button>
            </>
          ) : (
            <button type="button" onClick={valider} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 font-medium text-on-primary">
              <Icon name="check" size={20} />
              Je viens {momentFamilier(date, creneau)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
