"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { LieuVisual } from "@/components/LieuVisual";
import type { Lieu } from "@/lib/data";

export function LoginClient({ lieux }: { lieux: Lieu[] }) {
  const [principal, ...autres] = lieux;
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState<string[]>([]);

  function handleSignIn() {
    setSyncing(true);
    lieux.forEach((lieu, i) => {
      setTimeout(() => {
        setSynced((prev) => [...prev, lieu.id]);
        if (i === lieux.length - 1) {
          setTimeout(() => router.push("/planning"), 500);
        }
      }, (i + 1) * 550);
    });
  }

  if (syncing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-primary-container px-10">
        <div
          className="h-14 w-14 rounded-full border-4 border-[#F0D8CD] animate-spin"
          style={{ borderTopColor: "var(--md-primary)" }}
        />
        <div className="mt-7 text-xl font-medium text-on-primary-container">
          Synchronisation en cours…
        </div>
        <div className="mt-2 mb-9 max-w-xs text-center text-sm text-[#7A5A4E]">
          Récupération des calendriers Google des 3 lieux
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2.5">
          {lieux.map((lieu) => {
            const done = synced.includes(lieu.id);
            return (
              <div key={lieu.id} className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3">
                <Icon name={lieu.icone} style={{ color: lieu.couleur }} />
                <span className="flex-1 text-sm font-medium">{lieu.nom}</span>
                {done ? (
                  <Icon name="check_circle" style={{ color: lieu.couleur }} />
                ) : (
                  <span
                    className="h-4.5 w-4.5 rounded-full border-2 animate-spin"
                    style={{ borderColor: "#E3D3CB", borderTopColor: lieu.couleur }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Brand panel — desktop only */}
      <div className="hidden flex-col bg-primary-container p-13 md:flex md:w-[54%]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--md-primary)]">
            <Icon name="holiday_village" size={26} className="text-white" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-on-primary-container">Kikela</div>
        </div>
        <div className="mt-10 max-w-md text-[40px] leading-[1.1] font-bold tracking-tight text-on-primary-container">
          Réservez vos vacances en famille.
        </div>
        <div className="mt-3.5 mb-8 max-w-sm text-base leading-relaxed text-[#7A5A4E]">
          Un planning partagé pour les 3 lieux familiaux. Voyez qui vient, quand, et posez vos
          souhaits de séjour en quelques secondes.
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3.5">
          {principal && (
            <LieuVisual lieu={principal} className="col-span-2 h-38 w-full rounded-2xl" />
          )}
          {autres.map((lieu) => (
            <LieuVisual key={lieu.id} lieu={lieu} className="h-30 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Sign-in panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
        <div className="flex flex-col items-center gap-2 md:hidden">
          <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-[var(--md-primary)]">
            <Icon name="holiday_village" size={32} className="text-white" />
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-on-primary-container">Kikela</div>
          <div className="mb-6 text-center text-base text-[#7A5A4E]">
            Réservez vos vacances
            <br />
            en famille
          </div>
        </div>

        <div className="w-full max-w-90">
          <div className="hidden text-[28px] leading-tight md:block">Bon retour !</div>
          <div className="mb-9 mt-2 hidden text-[15px] leading-relaxed text-on-surface-variant md:block">
            Connectez-vous avec le compte Google de la famille pour accéder au calendrier partagé.
          </div>

          <GoogleSignInButton onClick={handleSignIn} />

          <div className="my-5.5 flex items-center gap-2 text-[13px] text-on-surface-muted">
            <span className="h-px flex-1 bg-outline-variant" />
            accès sécurisé
            <span className="h-px flex-1 bg-outline-variant" />
          </div>

          <div className="flex items-start gap-2 text-[12.5px] leading-relaxed text-on-surface-muted">
            <Icon name="shield" size={18} style={{ color: "var(--md-primary)" }} className="mt-px" />
            Kikela consulte et ajoute des événements dans votre Google Agenda familial. Vos autres
            calendriers restent privés.
          </div>
        </div>
      </div>
    </div>
  );
}
