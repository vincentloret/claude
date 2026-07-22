"use client";

import { useMemo, useState } from "react";
import { nomMois, formatPlageSemaine, type Lieu, type Foyer, type Sejour, type LieuId } from "@/lib/data";
import { getWeekDays, ajouterJours } from "@/lib/calendar";
import { Icon } from "@/components/Icon";
import { LieuChip } from "@/components/LieuChip";
import { SejourCard } from "@/components/SejourCard";
import { MonthCalendarDesktop } from "@/components/MonthCalendarDesktop";
import { MonthCalendarMobile } from "@/components/MonthCalendarMobile";
import { WeekCalendarDesktop } from "@/components/WeekCalendarDesktop";
import { WeekCalendarMobile } from "@/components/WeekCalendarMobile";
import { WishForm } from "@/components/WishForm";

const AUJOURDHUI = new Date(2026, 7, 22);

type Vue = "mois" | "semaine" | "liste";

type PlanningClientProps = {
  lieux: Lieu[];
  foyers: Foyer[];
  sejours: Sejour[];
  foyerConnecteId: string;
};

export function PlanningClient({ lieux, foyers, sejours, foyerConnecteId }: PlanningClientProps) {
  const [visibles, setVisibles] = useState<Set<LieuId>>(new Set(lieux.map((l) => l.id)));
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(7); // août (0-indexé)
  const [semaineAncre, setSemaineAncre] = useState(AUJOURDHUI);
  const [vue, setVue] = useState<Vue>("mois");
  const [wishOpen, setWishOpen] = useState(false);

  function toggleLieu(id: LieuId) {
    setVisibles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  }

  function changeSemaine(delta: number) {
    setSemaineAncre((prev) => ajouterJours(prev, delta * 7));
  }

  function allerAujourdhui() {
    setYear(AUJOURDHUI.getFullYear());
    setMonth(AUJOURDHUI.getMonth());
    setSemaineAncre(AUJOURDHUI);
  }

  const sejoursFiltres = useMemo(
    () => sejours.filter((s) => visibles.has(s.lieuId)),
    [sejours, visibles]
  );

  const prochains = useMemo(
    () => [...sejoursFiltres].sort((a, b) => a.debut.localeCompare(b.debut)),
    [sejoursFiltres]
  );

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {/* Sidebar filtres + légende — desktop */}
      <aside className="hidden w-62 flex-none flex-col border-r border-outline-variant p-5.5 md:flex">
        <div className="mb-3 text-xs font-medium tracking-wide text-on-surface-muted uppercase">Lieux</div>
        <div className="flex flex-col gap-2">
          {lieux.map((lieu) => (
            <button key={lieu.id} onClick={() => toggleLieu(lieu.id)} className="flex items-center">
              <LieuChip lieu={lieu} selected={visibles.has(lieu.id)} />
              <span className="sr-only">{lieu.nom}</span>
              {visibles.has(lieu.id) && (
                <Icon name="check" size={18} style={{ color: lieu.couleur, marginLeft: "auto" }} />
              )}
            </button>
          ))}
        </div>

        <div className="my-5.5 h-px bg-outline-variant" />

        <div className="mb-3.5 text-xs font-medium tracking-wide text-on-surface-muted uppercase">Légende</div>
        <div className="mb-3 flex items-center gap-2.5">
          <div className="h-4 w-8.5 rounded" style={{ backgroundColor: "var(--md-on-surface-variant)" }} />
          <span className="text-[13px] text-[#4A3B34]">Réservation confirmée</span>
        </div>
        <div className="mb-5.5 flex items-center gap-2.5">
          <div
            className="h-4 w-8.5 rounded"
            style={{ border: "1.5px dashed var(--md-on-surface-variant)" }}
          />
          <span className="text-[13px] text-[#4A3B34]">Souhait exprimé</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {lieux.map((lieu) => (
            <div key={lieu.id} className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: lieu.couleur }} />
              <span className="text-[13px] text-[#4A3B34]">
                {lieu.nom} · {lieu.region.split(" · ")[0]}
              </span>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar mobile */}
        <div className="flex flex-col gap-3 px-4 pt-3 md:hidden">
          <div className="flex h-9.5 rounded-full border border-outline-variant overflow-hidden">
            {(["mois", "semaine", "liste"] as Vue[]).map((v) => (
              <button
                key={v}
                onClick={() => setVue(v)}
                className="flex flex-1 items-center justify-center gap-1.5 text-[13px] font-medium capitalize border-l border-outline-variant first:border-l-0"
                style={{
                  backgroundColor: vue === v ? "var(--md-primary-container)" : "transparent",
                  color: vue === v ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                }}
              >
                {vue === v && <Icon name="check" size={16} />}
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {lieux.map((lieu) => (
              <button key={lieu.id} onClick={() => toggleLieu(lieu.id)}>
                <LieuChip lieu={lieu} selected={visibles.has(lieu.id)} size="sm" />
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar desktop */}
        <div className="hidden items-center gap-4 px-5.5 pt-5 md:flex">
          <div className="flex items-center gap-1">
            <button onClick={() => (vue === "semaine" ? changeSemaine(-1) : changeMonth(-1))} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container-high">
              <Icon name="chevron_left" className="text-on-surface-variant" />
            </button>
            <div className="min-w-38 text-center text-xl font-medium">
              {vue === "semaine" ? formatPlageSemaine(getWeekDays(semaineAncre)) : nomMois(`${year}-${String(month + 1).padStart(2, "0")}`)}
            </div>
            <button onClick={() => (vue === "semaine" ? changeSemaine(1) : changeMonth(1))} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container-high">
              <Icon name="chevron_right" className="text-on-surface-variant" />
            </button>
          </div>
          <button
            onClick={allerAujourdhui}
            className="text-sm font-medium"
            style={{ color: "var(--md-primary)" }}
          >
            Aujourd&apos;hui
          </button>
          <div className="ml-auto flex h-9 rounded-full border border-outline-variant overflow-hidden">
            {(["mois", "semaine", "liste"] as Vue[]).map((v) => (
              <button
                key={v}
                onClick={() => setVue(v)}
                className="flex items-center gap-1.5 px-4 text-[13px] font-medium capitalize border-l border-outline-variant first:border-l-0"
                style={{
                  backgroundColor: vue === v ? "var(--md-primary-container)" : "transparent",
                  color: vue === v ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                }}
              >
                {vue === v && <Icon name="check" size={16} />}
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Period header — mobile */}
        <div className="flex items-center justify-center gap-2.5 px-4 pt-2.5 pb-1 md:hidden">
          <button onClick={() => (vue === "semaine" ? changeSemaine(-1) : changeMonth(-1))}>
            <Icon name="chevron_left" size={22} className="text-on-surface-variant" />
          </button>
          <div className="min-w-32 text-center text-lg font-medium">
            {vue === "semaine" ? formatPlageSemaine(getWeekDays(semaineAncre)) : nomMois(`${year}-${String(month + 1).padStart(2, "0")}`)}
          </div>
          <button onClick={() => (vue === "semaine" ? changeSemaine(1) : changeMonth(1))}>
            <Icon name="chevron_right" size={22} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto px-4 pb-4 md:px-5.5 md:pb-5.5">
            {vue === "mois" && (
              <>
                <div className="hidden md:block">
                  <MonthCalendarDesktop year={year} month={month} sejours={sejoursFiltres} lieux={lieux} foyers={foyers} />
                </div>
                <div className="md:hidden">
                  <MonthCalendarMobile year={year} month={month} sejours={sejoursFiltres} lieux={lieux} />
                  <div className="mt-3.5 flex items-center gap-4 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-5.5 rounded" style={{ backgroundColor: "var(--md-on-surface-variant)" }} />
                      <span className="text-xs text-on-surface-variant">Confirmé</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ border: "1.5px solid var(--md-on-surface-variant)" }} />
                      <span className="text-xs text-on-surface-variant">Souhait</span>
                    </div>
                  </div>
                  <div className="mt-4.5">
                    <div className="mb-2.5 text-[13px] font-medium text-on-surface-muted">Prochains séjours</div>
                    {prochains.slice(0, 4).map((s) => (
                      <SejourCard key={s.id} sejour={s} lieux={lieux} foyers={foyers} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {vue === "liste" && (
              <div className="pt-1">
                {prochains.length === 0 && (
                  <div className="text-sm text-on-surface-muted">Aucun séjour pour les lieux sélectionnés.</div>
                )}
                {prochains.map((s) => (
                  <SejourCard key={s.id} sejour={s} lieux={lieux} foyers={foyers} />
                ))}
              </div>
            )}

            {vue === "semaine" && (
              <>
                <div className="hidden md:block">
                  <WeekCalendarDesktop ancre={semaineAncre} sejours={sejoursFiltres} lieux={lieux} foyers={foyers} />
                </div>
                <div className="md:hidden">
                  <WeekCalendarMobile ancre={semaineAncre} sejours={sejoursFiltres} lieux={lieux} foyers={foyers} />
                </div>
              </>
            )}
          </div>

          {/* Prochains séjours — desktop */}
          <aside className="hidden w-81.5 flex-none overflow-y-auto border-l border-outline-variant bg-surface-container p-5.5 md:block">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[15px] font-medium">Prochains séjours</div>
              <Icon name="unfold_more" size={20} className="text-on-surface-muted" />
            </div>
            {prochains.length === 0 && (
              <div className="text-sm text-on-surface-muted">Aucun séjour pour les lieux sélectionnés.</div>
            )}
            {prochains.map((s) => (
              <SejourCard key={s.id} sejour={s} lieux={lieux} foyers={foyers} />
            ))}
          </aside>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setWishOpen(true)}
        className="fixed right-4 bottom-24 z-10 flex h-14 items-center gap-2.5 rounded-2xl px-5.5 font-medium text-white shadow-lg md:right-[352px] md:bottom-8"
        style={{ backgroundColor: "var(--md-primary)" }}
      >
        <Icon name="add" size={22} />
        Exprimer un souhait
      </button>

      {wishOpen && (
        <WishForm
          lieux={lieux}
          foyers={foyers}
          foyerConnecteId={foyerConnecteId}
          onClose={() => setWishOpen(false)}
        />
      )}
    </div>
  );
}
