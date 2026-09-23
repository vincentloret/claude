"use client";

import { useState, useTransition } from "react";
import { Icon } from "./Icon";
import { REMARQUES_PRETES } from "./ParticipationSheet";
import { ajouterAccompagnant, archiverAccompagnant, modifierAccompagnant } from "@/lib/actions";

type Accompagnant = { id: string; nom: string; remarque: string | null; archive: boolean };

function initiales(nom: string) {
  return nom.slice(0, 2).toUpperCase();
}

function Formulaire({
  initial,
  onAnnuler,
  onEnregistrer,
  enCours,
}: {
  initial: { nom: string; remarque: string };
  onAnnuler: () => void;
  onEnregistrer: (nom: string, remarque: string) => void;
  enCours: boolean;
}) {
  const [nom, setNom] = useState(initial.nom);
  const [remarque, setRemarque] = useState(initial.remarque);
  return (
    <div className="space-y-3 rounded-2xl bg-surface-container p-4">
      <label htmlFor="acc-nom" className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary">
        <span className="block text-xs text-on-surface-variant">Prénom</span>
        <input id="acc-nom" value={nom} onChange={(e) => setNom(e.target.value)} maxLength={60} className="w-full bg-transparent text-[15px] outline-none" />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {REMARQUES_PRETES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRemarque(r === "Allergie…" ? "Allergie : " : r)}
            className={`h-9 rounded-lg px-3 text-sm ${remarque === r ? "bg-secondary-container text-on-secondary-container" : "border border-outline text-on-surface-variant"}`}
          >
            {r}
          </button>
        ))}
      </div>
      <label htmlFor="acc-remarque" className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary">
        <span className="block text-xs text-on-surface-variant">Remarque permanente (facultatif)</span>
        <input id="acc-remarque" value={remarque} onChange={(e) => setRemarque(e.target.value)} maxLength={80} placeholder="Ex. : végétarienne" className="w-full bg-transparent text-[15px] outline-none" />
      </label>
      <p className="flex items-center gap-2 text-xs text-on-surface-variant">
        <Icon name="visibility" size={16} />
        Papa et Maman la verront à chaque repas où tu l&apos;amènes.
      </p>
      <div className="flex justify-end gap-2">
        <button onClick={onAnnuler} className="h-12 rounded-full px-4 font-medium text-primary">
          Annuler
        </button>
        <button onClick={() => onEnregistrer(nom, remarque)} disabled={enCours || !nom.trim()} className="h-12 rounded-full bg-primary px-5 font-medium text-on-primary disabled:opacity-50">
          Enregistrer
        </button>
      </div>
    </div>
  );
}

export function AccompagnantsClient({ accompagnants }: { accompagnants: Accompagnant[] }) {
  const [edition, setEdition] = useState<string | "nouveau" | null>(null);
  const [voirArchives, setVoirArchives] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actifs = accompagnants.filter((a) => !a.archive);
  const archives = accompagnants.filter((a) => a.archive);

  function executer(action: () => Promise<unknown>) {
    setErreur(null);
    startTransition(async () => {
      try {
        await action();
        setEdition(null);
      } catch {
        setErreur("Ça n'a pas marché. Réessaie.");
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-5 pb-8 md:pt-8">
      <header className="pr-14">
        <h1 className="text-[22px] leading-7 md:text-[28px] md:leading-9">Mes accompagnants</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Les personnes que tu amènes souvent. Leur remarque s&apos;affiche pour Papa et Maman.</p>
      </header>

      {erreur && <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">{erreur}</p>}

      {actifs.length === 0 && edition !== "nouveau" && (
        <p className="rounded-2xl bg-surface-container-low px-4 py-6 text-center text-on-surface-variant">
          Personne pour l&apos;instant. Ajoute ton ou ta partenaire, un ami qui vient souvent…
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {actifs.map((a) =>
          edition === a.id ? (
            <li key={a.id}>
              <Formulaire
                initial={{ nom: a.nom, remarque: a.remarque ?? "" }}
                onAnnuler={() => setEdition(null)}
                onEnregistrer={(nom, remarque) => executer(() => modifierAccompagnant(a.id, nom, remarque))}
                enCours={isPending}
              />
              <button onClick={() => executer(() => archiverAccompagnant(a.id, true))} className="mt-2 flex h-10 items-center gap-1.5 px-2 text-sm font-medium text-on-surface-variant">
                <Icon name="archive" size={18} />
                Archiver (il ne sera plus proposé, les repas passés restent)
              </button>
            </li>
          ) : (
            <li key={a.id}>
              <button onClick={() => setEdition(a.id)} className="flex w-full items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3 text-left hover:bg-surface-container">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-outline text-sm font-medium text-white">{initiales(a.nom)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{a.nom}</span>
                  {a.remarque ? (
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-tertiary-container px-2 py-0.5 text-xs text-on-tertiary-container">
                      <Icon name="eco" size={14} />
                      {a.remarque}
                    </span>
                  ) : (
                    <span className="block text-sm text-on-surface-variant">Aucune remarque</span>
                  )}
                </span>
                <Icon name="edit" size={20} className="text-on-surface-variant" />
              </button>
            </li>
          )
        )}
      </ul>

      {edition === "nouveau" ? (
        <Formulaire
          initial={{ nom: "", remarque: "" }}
          onAnnuler={() => setEdition(null)}
          onEnregistrer={(nom, remarque) => executer(() => ajouterAccompagnant(nom, remarque))}
          enCours={isPending}
        />
      ) : (
        <button onClick={() => setEdition("nouveau")} className="flex h-12 items-center justify-center gap-2 self-start rounded-2xl bg-primary px-5 font-medium text-on-primary shadow-sm">
          <Icon name="person_add" size={20} />
          Ajouter quelqu&apos;un
        </button>
      )}

      {archives.length > 0 && (
        <section className="mt-2">
          <button onClick={() => setVoirArchives((v) => !v)} className="flex h-12 items-center gap-2 text-sm font-medium text-on-surface-variant" aria-expanded={voirArchives}>
            <Icon name="archive" size={18} />
            Archivés ({archives.length})
            <Icon name={voirArchives ? "expand_less" : "expand_more"} size={20} />
          </button>
          {voirArchives && (
            <ul className="flex flex-col gap-2">
              {archives.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3 opacity-80">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-outline text-sm font-medium text-white">{initiales(a.nom)}</span>
                  <span className="flex-1">{a.nom}</span>
                  <button onClick={() => executer(() => archiverAccompagnant(a.id, false))} disabled={isPending} className="h-10 rounded-full px-3 text-sm font-medium text-primary">
                    Restaurer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
