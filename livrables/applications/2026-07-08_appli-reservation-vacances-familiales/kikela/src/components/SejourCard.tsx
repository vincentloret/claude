"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { findLieu, findFoyer, formatPlage, type Sejour, type Lieu, type Foyer } from "@/lib/data";
import { confirmerSejour, annulerSejour } from "@/lib/actions";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";

type SejourCardProps = {
  sejour: Sejour;
  lieux: Lieu[];
  foyers: Foyer[];
};

export function SejourCard({ sejour, lieux, foyers }: SejourCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const lieu = findLieu(lieux, sejour.lieuId)!;
  const foyer = sejour.foyerId ? findFoyer(foyers, sejour.foyerId) : undefined;
  const nomAffiche = foyer?.nom ?? sejour.titreGoogle ?? "Événement Google";
  const confirme = sejour.statut === "confirme";

  function handleConfirmer() {
    startTransition(async () => {
      await confirmerSejour(sejour.id);
      router.refresh();
    });
  }

  function handleAnnuler() {
    const message = confirme
      ? `Annuler la réservation de ${nomAffiche} à ${lieu.nom} ?`
      : `Retirer le souhait de ${nomAffiche} pour ${lieu.nom} ?`;
    if (!window.confirm(message)) return;
    startTransition(async () => {
      await annulerSejour(sejour.id);
      router.refresh();
    });
  }

  return (
    <div
      className="mb-3 flex gap-3 rounded-2xl border bg-surface p-3.5 last:mb-0"
      style={{ borderColor: confirme ? "var(--md-outline-variant)" : "#C7A9CE", borderStyle: confirme ? "solid" : "dashed" }}
    >
      <div
        className="w-1 flex-none rounded"
        style={{ backgroundColor: lieu.couleur, opacity: confirme ? 1 : 0.5 }}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Icon name={lieu.icone} size={16} style={{ color: lieu.couleur }} />
          <span className="text-sm font-medium">{lieu.nom}</span>
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={
              confirme
                ? { backgroundColor: lieu.couleurContainer, color: lieu.couleurOnContainer }
                : { backgroundColor: "var(--md-surface-container-high)", color: "var(--md-on-surface-variant)" }
            }
          >
            {confirme ? "Confirmé" : "Souhait"}
          </span>
        </div>
        <div className="mb-2 text-[13px] text-on-surface-variant">
          {formatPlage(sejour.debut, sejour.fin)}
          {sejour.note ? ` · « ${sejour.note} »` : ""}
        </div>
        <div className="flex items-center gap-2">
          {foyer ? (
            <Avatar foyer={foyer} size={26} />
          ) : (
            <span
              className="flex h-6.5 w-6.5 flex-none items-center justify-center rounded-full bg-surface-container-high"
              title="Importé depuis Google Agenda"
            >
              <Icon name="event" size={15} className="text-on-surface-variant" />
            </span>
          )}
          <span className="flex-1 truncate text-[13px] text-[#4A3B34]">{nomAffiche}</span>
          {sejour.personnes != null && (
            <span className="flex items-center gap-1 text-xs font-medium text-on-surface-muted">
              <Icon name="group" size={15} />
              {sejour.personnes}
            </span>
          )}
        </div>
        {!confirme && sejour.note?.startsWith("Créneau") && (
          <div className="mt-2 flex gap-1.5 rounded-lg bg-warning-container px-2.5 py-1.5 text-[11.5px] leading-snug text-warning-on-container">
            <Icon name="info" size={14} className="mt-px" />
            {sejour.note}
          </div>
        )}
        <div className="mt-2.5 flex items-center gap-4">
          {!confirme && (
            <button
              onClick={handleConfirmer}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs font-medium disabled:opacity-60"
              style={{ color: lieu.couleur }}
            >
              <Icon name="check_circle" size={16} />
              {isPending ? "Confirmation…" : "Confirmer la réservation"}
            </button>
          )}
          <button
            onClick={handleAnnuler}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-medium text-on-surface-muted disabled:opacity-60"
          >
            <Icon name="cancel" size={16} />
            {isPending ? "Annulation…" : confirme ? "Annuler la réservation" : "Retirer le souhait"}
          </button>
        </div>
      </div>
    </div>
  );
}
