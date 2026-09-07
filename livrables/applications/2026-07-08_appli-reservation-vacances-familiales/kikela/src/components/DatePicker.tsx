"use client";

import { useEffect, useRef, useState } from "react";
import { getMonthWeeks, isoOf, toDate } from "@/lib/calendar";
import { nomMois, formatDateFR } from "@/lib/data";
import { Icon } from "./Icon";

const joursSemaine = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

type Props = {
  label: string;
  value: string; // ISO yyyy-mm-dd
  onChange: (iso: string) => void;
  min?: string; // ISO yyyy-mm-dd — dates antérieures désactivées
};

export function DatePicker({ label, value, onChange, min }: Props) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => toDate(value).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => toDate(value).getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function togglePicker() {
    if (open) {
      setOpen(false);
      return;
    }
    const d = toDate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setOpen(true);
  }

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  const weeks = getMonthWeeks(viewYear, viewMonth);

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={togglePicker}
        className="w-full rounded-xl border border-outline px-3.5 py-2.5 text-left"
      >
        <span className="block text-[11px] text-on-surface-variant">{label}</span>
        <span className="block text-[15px]">{formatDateFR(value)}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-66 rounded-2xl border border-outline-variant bg-surface p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 hover:bg-surface-container-high"
              aria-label="Mois précédent"
            >
              <Icon name="chevron_left" size={18} className="text-on-surface-variant" />
            </button>
            <div className="text-[13px] font-medium capitalize">
              {nomMois(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`)}
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 hover:bg-surface-container-high"
              aria-label="Mois suivant"
            >
              <Icon name="chevron_right" size={18} className="text-on-surface-variant" />
            </button>
          </div>

          <div className="grid grid-cols-7 place-items-center gap-y-1">
            {joursSemaine.map((j) => (
              <div key={j} className="text-center text-[10px] font-medium text-on-surface-muted">
                {j[0]}
              </div>
            ))}
            {weeks.flat().map((d) => {
              const iso = isoOf(d);
              const disabled = min ? iso < min : false;
              const selected = iso === value;
              const horsMois = d.getMonth() !== viewMonth;
              return (
                <button
                  type="button"
                  key={iso}
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-30"
                  style={{
                    color: selected ? "#fff" : horsMois ? "#C9B7B0" : "var(--md-on-surface)",
                    backgroundColor: selected ? "var(--md-primary)" : "transparent",
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
