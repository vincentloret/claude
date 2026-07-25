"use client";

import { useState } from "react";
import { getMonthWeeks, sejoursForDay, isoOf } from "@/lib/calendar";
import { findLieu, formatDateCourte, type Sejour, type Lieu, type Foyer } from "@/lib/data";
import { Icon } from "./Icon";
import { SejourCard } from "./SejourCard";

const joursSemaine = ["L", "M", "M", "J", "V", "S", "D"];

type Props = {
  year: number;
  month: number;
  sejours: Sejour[];
  lieux: Lieu[];
  foyers: Foyer[];
};

export function MonthCalendarMobile({ year, month, sejours, lieux, foyers }: Props) {
  const weeks = getMonthWeeks(year, month);
  const [jourSelectionne, setJourSelectionne] = useState<Date | null>(null);

  const sejoursDuJour = jourSelectionne ? sejoursForDay(sejours, jourSelectionne) : [];

  return (
    <div>
      <div className="grid grid-cols-7 px-2.5 pb-1">
        {joursSemaine.map((j, i) => (
          <div key={i} className="text-center text-[11px] font-medium text-on-surface-muted">
            {j}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 px-2.5">
        {weeks.flatMap((week) =>
          week.map((d) => {
            const dayLieux = Array.from(
              new Map(
                sejoursForDay(sejours, d).map((s) => [s.lieuId, s])
              ).values()
            );
            return (
              <button
                key={d.toISOString()}
                onClick={() => dayLieux.length > 0 && setJourSelectionne(d)}
                className="flex h-11.5 flex-col items-center pt-1.5 transition-transform duration-150 active:scale-95"
              >
                <span
                  className="text-[13px] font-medium"
                  style={{ color: d.getMonth() === month ? "var(--md-on-surface)" : "#C9B7B0" }}
                >
                  {d.getDate()}
                </span>
                <div className="mt-1 flex gap-0.5">
                  {dayLieux.map((s) => {
                    const lieu = findLieu(lieux, s.lieuId)!;
                    const confirme = s.statut === "confirme";
                    return (
                      <span
                        key={s.lieuId}
                        className="h-2.25 w-2.25 rounded-full"
                        style={
                          confirme
                            ? { backgroundColor: lieu.couleur }
                            : { border: `2px solid ${lieu.couleur}`, boxSizing: "border-box" }
                        }
                      />
                    );
                  })}
                </div>
              </button>
            );
          })
        )}
      </div>

      {jourSelectionne && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setJourSelectionne(null)}>
          <div
            className="flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
              <div className="flex-1 text-base font-medium capitalize">{formatDateCourte(isoOf(jourSelectionne))}</div>
              <button
                onClick={() => setJourSelectionne(null)}
                aria-label="Fermer"
                className="rounded-full p-1 transition-transform duration-150 hover:rotate-90 active:scale-90"
              >
                <Icon name="close" size={22} className="text-on-surface-variant" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {sejoursDuJour.map((s) => (
                <SejourCard key={s.id} sejour={s} lieux={lieux} foyers={foyers} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
