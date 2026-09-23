"use client";

import { Icon } from "./Icon";
import { AvatarPile } from "./Avatar";
import { Confetti } from "./Confetti";
import { cleCreneau, jourNomme, libelleCreneau } from "@/lib/jours";
import type { CreneauVue, SaisieParticipation } from "@/lib/types";

type Props = {
  prenom: string;
  repas: SaisieParticipation[];
  creneaux: Record<string, CreneauVue>;
  moiId: string;
  nomsAccompagnants: (ids: string[]) => string[];
  retrouvailles: string[];
  onRetour: () => void;
};

export function Confirmation({ prenom, repas, creneaux, moiId, nomsAccompagnants, retrouvailles, onRetour }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-96px)] flex-col items-center bg-primary-container px-4 pt-12 pb-8 text-on-primary-container md:min-h-screen md:justify-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <Confetti />
        <span className="animate-pop-in flex h-24 w-24 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_0_0_10px_rgba(67,104,51,0.18)]">
          <Icon name="check" size={48} />
        </span>
      </div>
      <h1 className="mt-6 text-center text-[32px] leading-10">
        {repas.length ? `C'est validé, ${prenom} ! 🎉` : `C'est noté, ${prenom}`}
      </h1>
      <p className="mt-1 text-center">
        {repas.length ? (
          <>
            <strong className="font-medium">
              {repas.length} repas cette semaine.
            </strong>{" "}
            Papa et Maman sont prévenus.
          </>
        ) : (
          "Tu ne viens pas cette semaine. Papa et Maman sont prévenus."
        )}
      </p>

      {repas.length > 0 && (
        <ul className="mt-6 w-full max-w-lg divide-y divide-outline-variant rounded-[28px] bg-surface-container-lowest px-4 text-on-surface">
          {repas.map((s) => {
            const c = creneaux[cleCreneau(s.date, s.creneau)];
            const autres = c.participations.filter((p) => p.membre.id !== moiId).map((p) => p.membre);
            const accompagnants = nomsAccompagnants(s.accompagnantIds);
            const avec = [...accompagnants, ...autres.map((m) => m.nom)];
            return (
              <li key={cleCreneau(s.date, s.creneau)} className="flex items-center gap-3 py-3">
                <span className={`flex h-8 flex-none items-center gap-1 rounded-lg px-2 text-xs font-medium ${s.creneau === "dejeuner" ? "bg-lunch-container text-lunch" : "bg-dinner-container text-dinner"}`}>
                  <Icon name={s.creneau === "dejeuner" ? "light_mode" : "dark_mode"} size={16} />
                  {libelleCreneau(s.creneau)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">
                    {jourNomme(s.date)}
                    {c.ouvert && c.menuAnnonce ? ` · ${c.menuAnnonce.toLowerCase()}` : ""}
                  </span>
                  <span className="block truncate text-sm text-on-surface-variant">
                    {avec.length ? `Avec ${avec.join(", ")}` : "Avec Papa et Maman"}
                    {s.partsAEmporter ? ` · ${s.partsAEmporter} part${s.partsAEmporter > 1 ? "s" : ""} à emporter` : ""}
                  </span>
                </span>
                {autres.length > 0 && <AvatarPile membres={autres} size={28} anneau="var(--md-surface-container-lowest)" />}
              </li>
            );
          })}
        </ul>
      )}

      {retrouvailles.length > 0 && (
        <p className="mt-4 flex w-full max-w-lg items-center gap-3 rounded-2xl bg-secondary-container px-4 py-3 text-on-secondary-container">
          <Icon name="celebration" />
          Tu retrouves {retrouvailles.map((r) => r.replace(/ et toi /, " ")).join(", ")}.
        </p>
      )}

      <button onClick={onRetour} className="mt-8 flex h-12 w-full max-w-lg items-center justify-center gap-2 rounded-full bg-primary px-6 font-medium text-on-primary md:w-auto">
        <Icon name="calendar_view_week" size={20} />
        Retour à la semaine
      </button>
    </div>
  );
}
