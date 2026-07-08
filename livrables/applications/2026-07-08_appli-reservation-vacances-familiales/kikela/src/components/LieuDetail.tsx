"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lieu, Foyer, Sejour } from "@/lib/data";
import { Icon } from "./Icon";
import { LieuVisual } from "./LieuVisual";
import { WishForm } from "./WishForm";

type LieuDetailProps = {
  lieu: Lieu;
  lieux: Lieu[];
  foyers: Foyer[];
  sejours: Sejour[];
  foyerConnecteId: string;
};

export function LieuDetail({ lieu, lieux, foyers, sejours, foyerConnecteId }: LieuDetailProps) {
  const router = useRouter();
  const [wishOpen, setWishOpen] = useState(false);

  const aVenir = useMemo(
    () => sejours.filter((s) => s.lieuId === lieu.id && s.fin >= "2026-07-08").length,
    [sejours, lieu.id]
  );

  return (
    <div className="mx-auto max-w-5xl md:p-8">
      <div className="mb-2 flex items-center gap-3 px-4 pt-4 md:hidden">
        <button onClick={() => router.back()}>
          <Icon name="arrow_back" className="text-on-surface-variant" />
        </button>
        <div className="flex-1 text-lg font-normal">{lieu.nom}</div>
        <Icon name="ios_share" className="text-on-surface-variant" />
      </div>

      <div className="hidden items-center gap-3 border-b border-outline-variant px-2 pb-4 md:flex">
        <Link href="/lieux" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-high">
          <Icon name="arrow_back" className="text-on-surface-variant" />
        </Link>
        <div className="flex-1 text-xl font-normal">{lieu.nom}</div>
        <Icon name="ios_share" className="text-on-surface-variant" />
      </div>

      <LieuVisual lieu={lieu} className="mx-4 h-56 w-[calc(100%-2rem)] rounded-3xl md:mx-0 md:mt-6 md:h-64 md:w-full" />

      <div className="flex flex-col gap-8 px-4 py-5 md:flex-row md:px-0 md:py-7">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Icon name={lieu.icone} size={22} style={{ color: lieu.couleur }} />
            <span className="text-xl font-normal md:text-2xl">{lieu.nom}</span>
          </div>
          <div className="mb-4 flex items-center gap-1.5 text-sm text-on-surface-variant">
            <Icon name="location_on" size={18} />
            {lieu.region}
          </div>
          <div className="mb-5 flex gap-2.5">
            <div
              className="flex items-center gap-2 rounded-2xl px-3.5 py-2"
              style={{ backgroundColor: lieu.couleurContainer, color: lieu.couleurOnContainer }}
            >
              <Icon name="group" size={20} />
              <span className="text-sm font-medium">{lieu.capacite} personnes max.</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-primary-container px-3.5 py-2 text-on-primary-container">
              <Icon name="bed" size={20} />
              <span className="text-sm font-medium">{lieu.chambres} chambres</span>
            </div>
          </div>
          <p className="mb-6 max-w-xl text-[15px] leading-relaxed text-[#4A3B34]">{lieu.description}</p>

          <div className="mb-4 font-medium">Équipements</div>
          <div className="grid max-w-lg grid-cols-2 gap-x-6 gap-y-3.5">
            {lieu.equipements.map((eq) => (
              <div key={eq.label} className="flex items-center gap-3">
                <Icon name={eq.icone} size={22} className="text-on-surface-variant" />
                <span className="text-sm text-[#4A3B34]">{eq.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions — desktop sticky card */}
        <div className="hidden w-75 flex-none md:block">
          <div className="rounded-3xl border border-outline-variant bg-surface-container p-5">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: lieu.couleur }} />
              <span className="text-sm font-medium">{lieu.nom}</span>
            </div>
            <div className="mb-4.5 text-[13px] leading-relaxed text-on-surface-variant">
              {aVenir} séjour{aVenir > 1 ? "s" : ""} à venir sur ce lieu.
            </div>
            <button
              onClick={() => setWishOpen(true)}
              className="mb-2.5 flex h-13 w-full items-center justify-center gap-2 rounded-full font-medium text-white"
              style={{ backgroundColor: "var(--md-primary)" }}
            >
              <Icon name="add" size={20} />
              Exprimer un souhait
            </button>
            <Link
              href="/planning"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full border font-medium"
              style={{ borderColor: "var(--md-outline)", color: "var(--md-primary)" }}
            >
              <Icon name="calendar_month" size={20} />
              Voir le planning
            </Link>
          </div>
        </div>
      </div>

      {/* Actions — mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-[78px] flex gap-2.5 border-t border-outline-variant bg-surface p-4 md:hidden">
        <Link
          href="/planning"
          className="flex h-13 w-13 flex-none items-center justify-center rounded-full border"
          style={{ borderColor: "var(--md-outline)" }}
        >
          <Icon name="calendar_month" size={22} style={{ color: "var(--md-primary)" }} />
        </Link>
        <button
          onClick={() => setWishOpen(true)}
          className="flex h-13 flex-1 items-center justify-center gap-2 rounded-full font-medium text-white"
          style={{ backgroundColor: "var(--md-primary)" }}
        >
          <Icon name="add" size={20} />
          Exprimer un souhait
        </button>
      </div>

      {wishOpen && (
        <WishForm
          lieux={lieux}
          foyers={foyers}
          foyerConnecteId={foyerConnecteId}
          lieuInitial={lieu.id}
          onClose={() => setWishOpen(false)}
        />
      )}
    </div>
  );
}
