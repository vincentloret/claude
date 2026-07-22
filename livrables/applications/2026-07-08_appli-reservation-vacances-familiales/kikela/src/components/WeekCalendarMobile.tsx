import { getWeekDays, sejoursForDay } from "@/lib/calendar";
import type { Sejour, Lieu, Foyer } from "@/lib/data";
import { SejourCard } from "./SejourCard";

const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

type Props = {
  ancre: Date;
  sejours: Sejour[];
  lieux: Lieu[];
  foyers: Foyer[];
};

function memeJour(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function WeekCalendarMobile({ ancre, sejours, lieux, foyers }: Props) {
  const jours = getWeekDays(ancre);
  const aujourdhui = new Date();

  return (
    <div className="flex flex-col gap-4 pt-1">
      {jours.map((d, i) => {
        const sejoursJour = sejoursForDay(sejours, d);
        return (
          <div key={d.toISOString()}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-medium"
                style={
                  memeJour(d, aujourdhui)
                    ? { backgroundColor: "var(--md-primary)", color: "#fff" }
                    : { color: "var(--md-on-surface)" }
                }
              >
                {d.getDate()}
              </span>
              <span className="text-sm font-medium">{joursSemaine[i]}</span>
            </div>
            {sejoursJour.length === 0 ? (
              <div className="pl-9 text-xs text-on-surface-muted">Aucun séjour</div>
            ) : (
              sejoursJour.map((s) => <SejourCard key={s.id} sejour={s} lieux={lieux} foyers={foyers} />)
            )}
          </div>
        );
      })}
    </div>
  );
}
