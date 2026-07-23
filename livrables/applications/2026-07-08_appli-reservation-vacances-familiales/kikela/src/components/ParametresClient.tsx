"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { LieuEquipementsPhotos } from "./LieuEquipementsPhotos";
import {
  definirCalendrierLieu,
  definirMediaLieu,
  listerCalendriersGoogle,
  synchroniserCalendriers,
} from "@/lib/actions";
import type { LieuReglages } from "@/lib/queries";
import type { GoogleCalendarOption } from "@/lib/google-calendar-sync";

type ParametresClientProps = {
  lieux: LieuReglages[];
  emailConnecte: string | null;
};

export function ParametresClient({ lieux, emailConnecte }: ParametresClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [calendriers, setCalendriers] = useState<GoogleCalendarOption[] | null>(null);

  useEffect(() => {
    if (!emailConnecte) return;
    listerCalendriersGoogle().then(setCalendriers);
  }, [emailConnecte]);

  function handleChangerCalendrier(lieuId: string, googleCalendarId: string) {
    startTransition(async () => {
      await definirCalendrierLieu(lieuId, googleCalendarId);
      router.refresh();
    });
  }

  function handleSynchroniser() {
    startTransition(async () => {
      await synchroniserCalendriers();
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl p-5 md:p-8">
      <h1 className="mb-1 text-xl font-medium md:text-2xl">Réglages</h1>
      <p className="mb-6 text-sm text-on-surface-variant">
        Les coulisses de Kikela : le compte Google familial, les calendriers de chaque lieu, et le contenu des fiches.
      </p>

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface p-3.5">
        <span
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full"
          style={{
            backgroundColor: emailConnecte ? "var(--md-primary-container)" : "var(--md-surface-container-high)",
          }}
        >
          <Icon
            name={emailConnecte ? "check_circle" : "link_off"}
            size={20}
            style={{ color: emailConnecte ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)" }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">
            {emailConnecte ? "Compte Google connecté" : "Aucun compte Google connecté"}
          </div>
          {emailConnecte && <div className="truncate text-[13px] text-on-surface-variant">{emailConnecte}</div>}
        </div>
        {!emailConnecte && (
          <a
            href="/login"
            className="flex h-9 items-center rounded-full px-4 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            style={{ backgroundColor: "var(--md-primary)" }}
          >
            Connecter
          </a>
        )}
      </div>

      {emailConnecte && (
        <>
          <div className="mb-3 text-sm font-medium text-on-surface-variant">Calendrier associé à chaque lieu</div>
          <div className="mb-6 flex flex-col gap-2">
            {lieux.map((lieu) => (
              <label
                key={lieu.id}
                className="flex items-center gap-3 rounded-xl border border-outline px-3.5 py-2.5"
              >
                <span className="w-28 flex-none truncate text-sm font-medium">{lieu.nom}</span>
                <select
                  value={lieu.googleCalendarId ?? ""}
                  disabled={isPending || !calendriers}
                  onChange={(e) => handleChangerCalendrier(lieu.id, e.target.value)}
                  className="w-full bg-transparent text-[15px] outline-none disabled:opacity-60"
                >
                  <option value="">Aucun</option>
                  {calendriers?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {!calendriers && (
              <div className="text-xs text-on-surface-muted">Chargement des calendriers Google…</div>
            )}
          </div>

          <button
            onClick={handleSynchroniser}
            disabled={isPending}
            className="mb-8 flex h-12 items-center gap-2 rounded-full px-6.5 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            style={{ backgroundColor: "var(--md-primary)" }}
          >
            <Icon name="sync" size={20} />
            {isPending ? "Synchronisation…" : "Synchroniser maintenant"}
          </button>
        </>
      )}

      <div className="mb-3 text-sm font-medium text-on-surface-variant">Vidéo et lien de chaque fiche lieu</div>
      <div className="mb-8 flex flex-col gap-3">
        {lieux.map((lieu) => (
          <LieuMediaForm key={lieu.id} lieu={lieu} onSaved={() => router.refresh()} />
        ))}
      </div>

      <div className="mb-3 text-sm font-medium text-on-surface-variant">Équipements et photos de chaque lieu</div>
      <div className="flex flex-col gap-3">
        {lieux.map((lieu) => (
          <LieuEquipementsPhotos key={lieu.id} lieu={lieu} onSaved={() => router.refresh()} />
        ))}
      </div>
    </div>
  );
}

function LieuMediaForm({ lieu, onSaved }: { lieu: LieuReglages; onSaved: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [videoUrl, setVideoUrl] = useState(lieu.videoUrl ?? "");
  const [lienUrl, setLienUrl] = useState(lieu.lienUrl ?? "");
  const [lienLabel, setLienLabel] = useState(lieu.lienLabel ?? "");
  const modifie =
    videoUrl !== (lieu.videoUrl ?? "") ||
    lienUrl !== (lieu.lienUrl ?? "") ||
    lienLabel !== (lieu.lienLabel ?? "");

  function handleEnregistrer() {
    startTransition(async () => {
      await definirMediaLieu(lieu.id, videoUrl.trim(), lienUrl.trim(), lienLabel.trim());
      onSaved();
    });
  }

  return (
    <div className="rounded-xl border border-outline px-3.5 py-3">
      <div className="mb-2.5 text-sm font-medium">{lieu.nom}</div>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2">
          <Icon name="videocam" size={18} className="text-on-surface-variant" />
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Lien vidéo (YouTube, Vimeo…)"
            className="w-full bg-transparent text-[14px] outline-none"
          />
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2">
          <Icon name="link" size={18} className="text-on-surface-variant" />
          <input
            type="url"
            value={lienUrl}
            onChange={(e) => setLienUrl(e.target.value)}
            placeholder="Lien (annonce, site du lieu…)"
            className="w-full bg-transparent text-[14px] outline-none"
          />
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2">
          <Icon name="label" size={18} className="text-on-surface-variant" />
          <input
            type="text"
            value={lienLabel}
            onChange={(e) => setLienLabel(e.target.value)}
            placeholder="Intitulé du lien (ex : Annonce Airbnb)"
            className="w-full bg-transparent text-[14px] outline-none"
          />
        </label>
      </div>
      {modifie && (
        <button
          onClick={handleEnregistrer}
          disabled={isPending}
          className="mt-2.5 flex items-center gap-1.5 rounded-full text-xs font-medium transition-opacity duration-150 hover:opacity-70 disabled:opacity-60"
          style={{ color: "var(--md-primary)" }}
        >
          <Icon name="save" size={16} />
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      )}
    </div>
  );
}
