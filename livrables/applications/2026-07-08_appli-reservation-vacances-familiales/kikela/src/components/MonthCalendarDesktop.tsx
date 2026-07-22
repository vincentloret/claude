import { getMonthWeeks, layoutWeek } from "@/lib/calendar";
import { findLieu, findFoyer, type Sejour, type Lieu, type Foyer } from "@/lib/data";
import { Icon } from "./Icon";

const joursSemaine = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

type Props = {
  year: number;
  month: number; // 0-indexed
  sejours: Sejour[];
  lieux: Lieu[];
  foyers: Foyer[];
};

export function MonthCalendarDesktop({ year, month, sejours, lieux, foyers }: Props) {
  const weeks = getMonthWeeks(year, month);

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-7 border-b border-outline-variant pb-2">
        {joursSemaine.map((j) => (
          <div key={j} className="pl-1 text-xs font-medium text-on-surface-muted">
            {j}
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => {
        const bars = layoutWeek(week, sejours);
        const rowCount = Math.max(1, ...bars.map((b) => b.row + 1));
        const bodyHeight = rowCount * 26 + 8;

        return (
          <div key={wi} className="relative border-b border-outline-variant last:border-b-0">
            <div className="grid grid-cols-7">
              {week.map((d) => (
                <div
                  key={d.toISOString()}
                  className="border-r border-outline-variant/60 px-2 py-1.5 text-xs font-medium last:border-r-0"
                  style={{ color: d.getMonth() === month ? "var(--md-on-surface)" : "#C9B7B0" }}
                >
                  {d.getDate()}
                </div>
              ))}
            </div>
            <div className="relative" style={{ height: bodyHeight }}>
              {bars.map(({ sejour, colStart, colSpan, row }) => {
                const lieu = findLieu(lieux, sejour.lieuId)!;
                const foyer = sejour.foyerId ? findFoyer(foyers, sejour.foyerId) : undefined;
                const nomAffiche = foyer?.nom ?? sejour.titreGoogle ?? "Événement";
                const confirme = sejour.statut === "confirme";
                return (
                  <div
                    key={sejour.id}
                    className="absolute flex h-5.5 items-center gap-1.5 overflow-hidden rounded-md px-2 text-xs font-medium whitespace-nowrap"
                    style={{
                      left: `calc(${(colStart / 7) * 100}% + 4px)`,
                      width: `calc(${(colSpan / 7) * 100}% - 8px)`,
                      top: row * 26,
                      background: confirme ? lieu.couleur : lieu.couleurContainer,
                      color: confirme ? "#fff" : lieu.couleurOnContainer,
                      border: confirme ? undefined : `1.5px dashed ${lieu.couleur}`,
                    }}
                    title={`${lieu.nom} · ${nomAffiche}`}
                  >
                    {colSpan > 1 && <Icon name={lieu.icone} size={14} />}
                    {colSpan > 2 ? nomAffiche : ""}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
