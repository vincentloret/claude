import { getWeekDays, layoutWeek } from "@/lib/calendar";
import { findLieu, findFoyer, type Sejour, type Lieu, type Foyer } from "@/lib/data";
import { Icon } from "./Icon";

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

export function WeekCalendarDesktop({ ancre, sejours, lieux, foyers }: Props) {
  const jours = getWeekDays(ancre);
  const bars = layoutWeek(jours, sejours);
  const rowCount = Math.max(1, ...bars.map((b) => b.row + 1));
  const bodyHeight = rowCount * 40 + 12;
  const aujourdhui = new Date();

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-7 border-b border-outline-variant pb-2">
        {jours.map((d, i) => (
          <div key={d.toISOString()} className="px-2 text-xs font-medium text-on-surface-muted">
            <div>{joursSemaine[i]}</div>
            <div
              className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[15px]"
              style={
                memeJour(d, aujourdhui)
                  ? { backgroundColor: "var(--md-primary)", color: "#fff" }
                  : { color: "var(--md-on-surface)" }
              }
            >
              {d.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-3" style={{ height: bodyHeight }}>
        <div className="absolute inset-0 grid grid-cols-7">
          {jours.map((d) => (
            <div key={d.toISOString()} className="border-r border-outline-variant/60 last:border-r-0" />
          ))}
        </div>

        {bars.map(({ sejour, colStart, colSpan, row }) => {
          const lieu = findLieu(lieux, sejour.lieuId)!;
          const foyer = sejour.foyerId ? findFoyer(foyers, sejour.foyerId) : undefined;
          const nomAffiche = foyer?.nom ?? sejour.titreGoogle ?? "Événement";
          const confirme = sejour.statut === "confirme";
          return (
            <div
              key={sejour.id}
              className="absolute flex h-8.5 items-center gap-1.5 overflow-hidden rounded-lg px-2.5 text-[13px] font-medium whitespace-nowrap"
              style={{
                left: `calc(${(colStart / 7) * 100}% + 4px)`,
                width: `calc(${(colSpan / 7) * 100}% - 8px)`,
                top: row * 40,
                background: confirme ? lieu.couleur : lieu.couleurContainer,
                color: confirme ? "#fff" : lieu.couleurOnContainer,
                border: confirme ? undefined : `1.5px dashed ${lieu.couleur}`,
              }}
              title={`${lieu.nom} · ${nomAffiche}`}
            >
              <Icon name={lieu.icone} size={16} />
              {nomAffiche}
            </div>
          );
        })}
      </div>

      {bars.length === 0 && (
        <div className="flex h-24 items-center justify-center text-sm text-on-surface-muted">
          Aucun séjour cette semaine pour les lieux sélectionnés.
        </div>
      )}
    </div>
  );
}
