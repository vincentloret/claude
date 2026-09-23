"use client";

import { useEffect, useState, useTransition } from "react";
import { Icon } from "./Icon";
import { Stepper } from "./ParticipationSheet";
import { creerPeriode } from "@/lib/actions";
import { ajouterJours, aujourdhui, creneauxDePeriode, DUREE_MAX_PERIODE, jourEtMois } from "@/lib/jours";
import type { AccompagnantVue } from "@/lib/types";

const JOURS = ["L", "M", "M", "J", "V", "S", "D"];
const NOMS_JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

type Repas = "dejeuner" | "diner" | "les-deux";

export function PeriodeSheet({
  debutPropose,
  accompagnants,
  onCree,
  onFermer,
}: {
  debutPropose: string;
  accompagnants: AccompagnantVue[];
  onCree: (nbRepas: number) => void;
  onFermer: () => void;
}) {
  const auj = aujourdhui();
  const [nom, setNom] = useState("");
  const [debut, setDebut] = useState(debutPropose < auj ? auj : debutPropose);
  const [fin, setFin] = useState(ajouterJours(debutPropose < auj ? auj : debutPropose, 13));
  const [repas, setRepas] = useState<Repas>("diner");
  const [jours, setJours] = useState<number[]>([1, 2, 3, 4, 5]);
  const [accompagnantIds, setAccompagnantIds] = useState<string[]>([]);
  const [partsAEmporter, setPartsAEmporter] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function touche(e: KeyboardEvent) {
      if (e.key === "Escape") onFermer();
    }
    document.addEventListener("keydown", touche);
    return () => document.removeEventListener("keydown", touche);
  }, [onFermer]);

  const datesValides = !!debut && !!fin && fin >= debut && ajouterJours(debut, DUREE_MAX_PERIODE) >= fin;
  const nbRepas = datesValides ? creneauxDePeriode(debut, fin, repas !== "diner", repas !== "dejeuner", jours).length : 0;
  const libelleRepas = repas === "dejeuner" ? "déjeuner" : repas === "diner" ? "dîner" : "repas";

  function basculerJour(j: number) {
    setJours((l) => (l.includes(j) ? l.filter((x) => x !== j) : [...l, j].sort()));
  }

  function valider() {
    setErreur(null);
    startTransition(async () => {
      try {
        const r = await creerPeriode({
          nom,
          debut,
          fin,
          dejeuner: repas !== "diner",
          diner: repas !== "dejeuner",
          jours,
          accompagnantIds,
          supplementaires: 0,
          partsAEmporter,
          platFavoriId: null,
          envies: "",
          commentaire,
        });
        onCree(r.nbRepas);
      } catch (e) {
        setErreur(e instanceof Error && e.message ? e.message : "La période n'a pas pu être créée. Réessaie.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end" role="dialog" aria-modal="true" aria-labelledby="titre-periode">
      <button className="absolute inset-0 bg-black/30" onClick={onFermer} aria-label="Fermer" tabIndex={-1} />
      <div className="animate-sheet relative flex max-h-[94vh] w-full flex-col rounded-t-[28px] bg-surface-container-low shadow-xl md:h-full md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-[28px]">
        <div className="mx-auto mt-3 h-1 w-8 rounded-full bg-outline/40 md:hidden" />
        <div className="flex items-start gap-3 px-6 pt-4 pb-3 md:pt-6">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
            <Icon name="date_range" size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="titre-periode" className="text-[22px] leading-7">Venir sur une période</h2>
            <p className="text-sm text-on-surface-variant">Stage, vacances, semaines chargées…</p>
          </div>
          <button onClick={onFermer} className="flex h-12 w-12 flex-none items-center justify-center rounded-full hover:bg-surface-container-high" aria-label="Fermer">
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-4">
          <label htmlFor="periode-nom" className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary">
            <span className="block text-xs text-on-surface-variant">Nom de la période (facultatif)</span>
            <input id="periode-nom" value={nom} onChange={(e) => setNom(e.target.value)} maxLength={60} placeholder="Ex. : Mon stage en octobre" className="w-full bg-transparent text-[15px] outline-none" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label htmlFor="periode-debut" className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary">
              <span className="block text-xs text-on-surface-variant">Du</span>
              <input id="periode-debut" type="date" min={auj} value={debut} onChange={(e) => setDebut(e.target.value)} className="w-full bg-transparent text-[15px] outline-none" />
            </label>
            <label htmlFor="periode-fin" className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary">
              <span className="block text-xs text-on-surface-variant">Au (inclus)</span>
              <input id="periode-fin" type="date" min={debut} value={fin} onChange={(e) => setFin(e.target.value)} className="w-full bg-transparent text-[15px] outline-none" />
            </label>
          </div>

          <section>
            <h3 className="mb-2 text-sm font-medium">Quels repas ?</h3>
            <div className="grid grid-cols-3 overflow-hidden rounded-full border border-outline" role="group" aria-label="Quels repas">
              {(
                [
                  ["dejeuner", "Déjeuner"],
                  ["diner", "Dîner"],
                  ["les-deux", "Les deux"],
                ] as [Repas, string][]
              ).map(([v, l], i) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRepas(v)}
                  aria-pressed={repas === v}
                  className={`flex h-12 items-center justify-center gap-1 text-sm font-medium ${i > 0 ? "border-l border-outline" : ""} ${repas === v ? "bg-secondary-container text-on-secondary-container" : ""}`}
                >
                  {repas === v && <Icon name="check" size={18} />}
                  {l}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-medium">Quels jours ?</h3>
            <div className="flex justify-between gap-1">
              {JOURS.map((j, i) => {
                const actif = jours.includes(i + 1);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => basculerJour(i + 1)}
                    aria-pressed={actif}
                    aria-label={NOMS_JOURS[i]}
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium ${actif ? "bg-secondary-container text-on-secondary-container" : "border border-outline text-on-surface-variant"}`}
                  >
                    {j}
                  </button>
                );
              })}
            </div>
          </section>

          {accompagnants.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-medium">
                Accompagnants <span className="font-normal text-on-surface-variant">pour tous les repas</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {accompagnants.map((a) => {
                  const actif = accompagnantIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAccompagnantIds((ids) => (actif ? ids.filter((x) => x !== a.id) : [...ids, a.id]))}
                      aria-pressed={actif}
                      className={`flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm ${actif ? "bg-secondary-container text-on-secondary-container" : "border border-outline text-on-surface-variant"}`}
                    >
                      {actif && <Icon name="check" size={18} />}
                      {a.nom}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <Stepper id="periode-emporter" label="Parts à emporter" aide={`À chaque ${libelleRepas}, pour le lendemain`} valeur={partsAEmporter} onChange={setPartsAEmporter} />

          <label htmlFor="periode-commentaire" className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary">
            <span className="block text-xs text-on-surface-variant">Commentaire</span>
            <input id="periode-commentaire" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} maxLength={200} placeholder="Ex. : j'arrive vers 19 h 30" className="w-full bg-transparent text-[15px] outline-none" />
          </label>

          <div className="flex items-center gap-3 rounded-2xl bg-secondary-container px-4 py-3 text-on-secondary-container">
            <Icon name="date_range" />
            <div>
              <div className="font-medium">
                {datesValides ? `${nbRepas} ${libelleRepas}${nbRepas > 1 ? "s" : ""} du ${jourEtMois(debut)} au ${jourEtMois(fin)}` : "Vérifie les dates"}
              </div>
              <div className="text-xs">Les repas déjà prévus restent tels quels. Tu pourras en retirer un sans casser la période.</div>
            </div>
          </div>
          {erreur && <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">{erreur}</p>}
        </div>

        <div className="flex items-center gap-3 border-t border-outline-variant px-6 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onFermer} className="h-12 rounded-full px-4 font-medium text-primary">
            Annuler
          </button>
          <button
            type="button"
            onClick={valider}
            disabled={isPending || !datesValides || nbRepas === 0}
            className="ml-auto flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-on-primary disabled:opacity-50"
          >
            <Icon name="check" size={20} />
            {isPending ? "Création…" : `Créer les ${nbRepas} repas`}
          </button>
        </div>
      </div>
    </div>
  );
}
