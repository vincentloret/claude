import { getMonthWeeks, sejoursForDay } from "@/lib/calendar";
import { findLieu, type Sejour, type Lieu } from "@/lib/data";

const joursSemaine = ["L", "M", "M", "J", "V", "S", "D"];

type Props = {
  year: number;
  month: number;
  sejours: Sejour[];
  lieux: Lieu[];
};

export function MonthCalendarMobile({ year, month, sejours, lieux }: Props) {
  const weeks = getMonthWeeks(year, month);

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
              <div
                key={d.toISOString()}
                className="flex h-11.5 flex-col items-center pt-1.5"
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
