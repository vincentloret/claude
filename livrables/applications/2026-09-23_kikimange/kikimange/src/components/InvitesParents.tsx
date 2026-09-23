"use client";

import { useState, useTransition } from "react";
import { Icon } from "./Icon";
import { Stepper } from "./ParticipationSheet";
import { ajouterInvite, supprimerInvite } from "@/lib/actions";
import type { Creneau } from "@/lib/jours";
import type { InviteVue } from "@/lib/types";

export function InvitesParents({ date, creneau, invites, estParent }: { date: string; creneau: Creneau; invites: InviteVue[]; estParent: boolean }) {
  const [ajout, setAjout] = useState(false);
  const [nom, setNom] = useState("");
  const [nombre, setNombre] = useState(1);
  const [remarque, setRemarque] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!estParent && invites.length === 0) return null;

  function ajouter() {
    setErreur(null);
    startTransition(async () => {
      try {
        await ajouterInvite(date, creneau, nom, nombre, remarque);
        setNom("");
        setNombre(1);
        setRemarque("");
        setAjout(false);
      } catch {
        setErreur("Impossible d'ajouter cet invité. Réessaie.");
      }
    });
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-on-surface-variant">{estParent ? "Vos invités" : "Invités de Papa et Maman"}</h2>
        {estParent && !ajout && (
          <button onClick={() => setAjout(true)} className="flex h-10 items-center gap-1.5 rounded-full bg-secondary-container px-4 text-sm font-medium text-on-secondary-container">
            <Icon name="person_add" size={18} />
            Ajouter un invité
          </button>
        )}
      </div>

      {invites.length > 0 && (
        <ul className="divide-y divide-outline-variant rounded-2xl bg-surface-container-low px-4">
          {invites.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant">
                <Icon name="person" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{i.nom}</div>
                {i.remarque && <div className="text-sm text-on-surface-variant">{i.remarque}</div>}
              </div>
              <span className="text-sm tabular-nums text-on-surface-variant">{i.nombre}</span>
              {estParent && (
                <button
                  onClick={() => startTransition(() => supprimerInvite(i.id))}
                  disabled={isPending}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
                  aria-label={`Retirer ${i.nom}`}
                >
                  <Icon name="close" size={20} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {estParent && invites.length === 0 && !ajout && (
        <p className="rounded-2xl bg-surface-container-low px-4 py-4 text-on-surface-variant">Personne pour l&apos;instant.</p>
      )}

      {ajout && (
        <div className="mt-2 space-y-3 rounded-2xl bg-surface-container p-4">
          <label htmlFor="invite-nom" className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary">
            <span className="block text-xs text-on-surface-variant">Prénom</span>
            <input id="invite-nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. : Mamie Jo" className="w-full bg-transparent text-[15px] outline-none" />
          </label>
          <label htmlFor="invite-remarque" className="block rounded-xl border border-outline px-3 pt-1.5 pb-2 focus-within:border-primary">
            <span className="block text-xs text-on-surface-variant">Remarque (facultatif)</span>
            <input id="invite-remarque" value={remarque} onChange={(e) => setRemarque(e.target.value)} placeholder="Ex. : sans sel" className="w-full bg-transparent text-[15px] outline-none" />
          </label>
          <Stepper id="invite-nombre" label="Personnes" aide="Si elle vient accompagnée" valeur={nombre} onChange={(n) => setNombre(Math.max(1, n))} />
          {erreur && <p className="text-sm text-error">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setAjout(false)} className="h-12 rounded-full px-4 font-medium text-primary">
              Annuler
            </button>
            <button onClick={ajouter} disabled={isPending || !nom.trim()} className="flex h-12 items-center gap-1.5 rounded-full bg-primary px-5 font-medium text-on-primary disabled:opacity-50">
              <Icon name="check" size={20} />
              Ajouter
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
