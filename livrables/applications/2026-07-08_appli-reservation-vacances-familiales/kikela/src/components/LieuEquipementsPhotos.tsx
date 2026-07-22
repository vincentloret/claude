"use client";

import { useState, useTransition } from "react";
import { Icon } from "./Icon";
import { ajouterEquipement, supprimerEquipement, ajouterPhoto, supprimerPhoto } from "@/lib/actions";
import type { LieuReglages } from "@/lib/queries";

export function LieuEquipementsPhotos({ lieu, onSaved }: { lieu: LieuReglages; onSaved: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [icone, setIcone] = useState("");
  const [label, setLabel] = useState("");
  const [urlPhoto, setUrlPhoto] = useState("");

  function handleAjouterEquipement() {
    if (!icone.trim() || !label.trim()) return;
    startTransition(async () => {
      await ajouterEquipement(lieu.id, icone.trim(), label.trim());
      setIcone("");
      setLabel("");
      onSaved();
    });
  }

  function handleSupprimerEquipement(id: number) {
    startTransition(async () => {
      await supprimerEquipement(id);
      onSaved();
    });
  }

  function handleAjouterPhoto() {
    if (!urlPhoto.trim()) return;
    startTransition(async () => {
      await ajouterPhoto(lieu.id, urlPhoto.trim());
      setUrlPhoto("");
      onSaved();
    });
  }

  function handleSupprimerPhoto(id: number) {
    startTransition(async () => {
      await supprimerPhoto(id);
      onSaved();
    });
  }

  return (
    <div className="rounded-xl border border-outline px-3.5 py-3">
      <div className="mb-2.5 text-sm font-medium">{lieu.nom}</div>

      <div className="mb-1.5 text-xs font-medium text-on-surface-variant">Équipements</div>
      <div className="mb-2 flex flex-col gap-1.5">
        {lieu.equipements.map((eq) => (
          <div
            key={eq.id}
            className="flex items-center gap-2 rounded-lg bg-surface-container-high px-3 py-1.5 text-sm"
          >
            <Icon name={eq.icone} size={16} className="text-on-surface-variant" />
            <span className="flex-1 truncate">{eq.label}</span>
            <button
              onClick={() => handleSupprimerEquipement(eq.id)}
              disabled={isPending}
              aria-label={`Retirer ${eq.label}`}
              className="disabled:opacity-60"
            >
              <Icon name="close" size={16} className="text-on-surface-muted" />
            </button>
          </div>
        ))}
        {lieu.equipements.length === 0 && (
          <div className="text-xs text-on-surface-muted">Aucun équipement.</div>
        )}
      </div>
      <div className="mb-4 flex items-center gap-1.5">
        <input
          type="text"
          value={icone}
          onChange={(e) => setIcone(e.target.value)}
          placeholder="Icône (ex : wifi)"
          className="w-28 flex-none rounded-lg border border-outline-variant bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Libellé (ex : Wifi fibre)"
          className="w-full rounded-lg border border-outline-variant bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
        />
        <button
          onClick={handleAjouterEquipement}
          disabled={isPending || !icone.trim() || !label.trim()}
          aria-label="Ajouter l'équipement"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full disabled:opacity-40"
          style={{ backgroundColor: "var(--md-primary-container)" }}
        >
          <Icon name="add" size={18} style={{ color: "var(--md-on-primary-container)" }} />
        </button>
      </div>

      <div className="mb-1.5 text-xs font-medium text-on-surface-variant">Photos</div>
      <div className="mb-2 flex flex-col gap-1.5">
        {lieu.photos.map((photo) => (
          <div key={photo.id} className="flex items-center gap-2 rounded-lg bg-surface-container-high px-2 py-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- URLs externes arbitraires */}
            <img src={photo.url} alt="" className="h-9 w-13 flex-none rounded object-cover" />
            <span className="flex-1 truncate text-[12px] text-on-surface-variant">{photo.url}</span>
            <button
              onClick={() => handleSupprimerPhoto(photo.id)}
              disabled={isPending}
              aria-label="Retirer la photo"
              className="disabled:opacity-60"
            >
              <Icon name="close" size={16} className="text-on-surface-muted" />
            </button>
          </div>
        ))}
        {lieu.photos.length === 0 && <div className="text-xs text-on-surface-muted">Aucune photo.</div>}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="url"
          value={urlPhoto}
          onChange={(e) => setUrlPhoto(e.target.value)}
          placeholder="URL de la photo"
          className="w-full rounded-lg border border-outline-variant bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
        />
        <button
          onClick={handleAjouterPhoto}
          disabled={isPending || !urlPhoto.trim()}
          aria-label="Ajouter la photo"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full disabled:opacity-40"
          style={{ backgroundColor: "var(--md-primary-container)" }}
        >
          <Icon name="add" size={18} style={{ color: "var(--md-on-primary-container)" }} />
        </button>
      </div>
    </div>
  );
}
