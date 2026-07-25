"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { ajouterFoyer, supprimerFoyer } from "@/lib/actions";
import type { Foyer } from "@/lib/data";

export function FoyersManager({ foyers }: { foyers: Foyer[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nom, setNom] = useState("");
  const [initiales, setInitiales] = useState("");
  const [couleur, setCouleur] = useState("#a5492a");

  function handleAjouter() {
    if (!nom.trim() || !initiales.trim()) return;
    startTransition(async () => {
      await ajouterFoyer(nom.trim(), initiales.trim().toUpperCase().slice(0, 2), couleur);
      setNom("");
      setInitiales("");
      router.refresh();
    });
  }

  function handleSupprimer(foyer: Foyer) {
    if (!window.confirm(`Retirer ${foyer.nom} de la famille ?`)) return;
    startTransition(async () => {
      const resultat = await supprimerFoyer(foyer.id);
      if (!resultat.succes) {
        window.alert(resultat.erreur);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {foyers.map((foyer) => (
        <div
          key={foyer.id}
          className="flex items-center gap-3 rounded-xl border border-outline px-3.5 py-2.5"
        >
          <Avatar foyer={foyer} size={32} />
          <span className="flex-1 truncate text-sm font-medium">{foyer.nom}</span>
          <button
            onClick={() => handleSupprimer(foyer)}
            disabled={isPending}
            aria-label={`Retirer ${foyer.nom}`}
            className="rounded-full transition-transform duration-150 hover:scale-125 disabled:opacity-60"
          >
            <Icon name="close" size={18} className="text-on-surface-muted" />
          </button>
        </div>
      ))}

      <div className="mt-1 flex items-center gap-1.5">
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du foyer (ex : Papy Mamie)"
          className="w-full rounded-lg border border-outline-variant bg-transparent px-2.5 py-2 text-[13px] outline-none"
        />
        <input
          type="text"
          value={initiales}
          onChange={(e) => setInitiales(e.target.value)}
          placeholder="Init."
          maxLength={2}
          className="w-16 flex-none rounded-lg border border-outline-variant bg-transparent px-2.5 py-2 text-[13px] outline-none"
        />
        <input
          type="color"
          value={couleur}
          onChange={(e) => setCouleur(e.target.value)}
          aria-label="Couleur du foyer"
          className="h-9 w-9 flex-none rounded-lg border border-outline-variant bg-transparent p-0.5"
        />
        <button
          onClick={handleAjouter}
          disabled={isPending || !nom.trim() || !initiales.trim()}
          aria-label="Ajouter le foyer"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full transition-transform duration-150 hover:scale-110 active:scale-90 disabled:opacity-40 disabled:hover:scale-100"
          style={{ backgroundColor: "var(--md-primary-container)" }}
        >
          <Icon name="add" size={18} style={{ color: "var(--md-on-primary-container)" }} />
        </button>
      </div>
    </div>
  );
}
