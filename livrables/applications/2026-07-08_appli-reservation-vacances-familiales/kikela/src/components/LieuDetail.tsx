"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lieu, Foyer, Sejour } from "@/lib/data";
import { Icon } from "./Icon";
import { LieuVisual } from "./LieuVisual";
import { WishForm } from "./WishForm";

/** Convertit une URL YouTube/Vimeo en URL embarquable, ou undefined si le format n'est pas reconnu. */
function urlEmbedVideo(url: string): string | undefined {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : undefined;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

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
        <button onClick={() => router.back()} className="rounded-full p-1 transition-transform duration-150 active:scale-90">
          <Icon name="arrow_back" className="text-on-surface-variant" />
        </button>
        <div className="flex-1 text-lg font-normal">{lieu.nom}</div>
        <Icon name="ios_share" className="text-on-surface-variant" />
      </div>

      <div className="hidden items-center gap-3 border-b border-outline-variant px-2 pb-4 md:flex">
        <Link href="/lieux" className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150 hover:bg-surface-container-high">
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
          <div className="mb-6 grid max-w-lg grid-cols-2 gap-x-6 gap-y-3.5">
            {lieu.equipements.map((eq) => (
              <div key={eq.label} className="flex items-center gap-3">
                <Icon name={eq.icone} size={22} className="text-on-surface-variant" />
                <span className="text-sm text-[#4A3B34]">{eq.label}</span>
              </div>
            ))}
          </div>

          {lieu.videoUrl && (
            <div className="mb-6 max-w-xl">
              <div className="mb-3 font-medium">Vidéo</div>
              {urlEmbedVideo(lieu.videoUrl) ? (
                <div className="aspect-video overflow-hidden rounded-2xl bg-black">
                  <iframe
                    src={urlEmbedVideo(lieu.videoUrl)}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={lieu.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: "var(--md-primary)" }}
                >
                  <Icon name="videocam" size={18} />
                  Voir la vidéo
                </a>
              )}
            </div>
          )}

          {lieu.lienUrl && (
            <a
              href={lieu.lienUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-6 flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--md-primary)" }}
            >
              <Icon name="link" size={18} />
              {lieu.lienLabel ?? lieu.lienUrl.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        {/* Actions — desktop sticky card */}
        <div className="hidden w-75 flex-none md:block">
          <div className="rounded-3xl border border-outline-variant bg-surface-container p-5">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: lieu.couleur }} />
              <span className="text-sm font-medium">{lieu.nom}</span>
            </div>
            <div className="mb-4.5 text-[13px] leading-relaxed text-on-surface-variant">
              {aVenir > 0
                ? `${aVenir} séjour${aVenir > 1 ? "s" : ""} déjà prévu${aVenir > 1 ? "s" : ""} ici.`
                : "Personne n'a encore posé ses valises ici."}
            </div>
            <button
              onClick={() => setWishOpen(true)}
              className="mb-2.5 flex h-13 w-full items-center justify-center gap-2 rounded-full font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
              style={{ backgroundColor: "var(--md-primary)" }}
            >
              <Icon name="add" size={20} />
              Poser un souhait
            </button>
            <Link
              href="/planning"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full border font-medium transition-colors duration-150 hover:bg-primary-container"
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
          className="flex h-13 w-13 flex-none items-center justify-center rounded-full border transition-colors duration-150 hover:bg-primary-container"
          style={{ borderColor: "var(--md-outline)" }}
        >
          <Icon name="calendar_month" size={22} style={{ color: "var(--md-primary)" }} />
        </Link>
        <button
          onClick={() => setWishOpen(true)}
          className="flex h-13 flex-1 items-center justify-center gap-2 rounded-full font-medium text-white transition-all duration-200 active:scale-[0.98]"
          style={{ backgroundColor: "var(--md-primary)" }}
        >
          <Icon name="add" size={20} />
          Poser un souhait
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
