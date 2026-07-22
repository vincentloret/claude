import type { Sejour } from "./data";

export function toDate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// Lundi = 0 ... Dimanche = 6
function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** Les 7 jours (lundi à dimanche) de la semaine contenant `date`. */
export function getWeekDays(date: Date): Date[] {
  const start = addDays(date, -mondayIndex(date));
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function ajouterJours(date: Date, n: number): Date {
  return addDays(date, n);
}

export function getMonthWeeks(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1);
  const start = addDays(firstOfMonth, -mondayIndex(firstOfMonth));

  const lastOfMonth = new Date(year, month + 1, 0);
  const end = addDays(lastOfMonth, 6 - mondayIndex(lastOfMonth));

  const weeks: Date[][] = [];
  let cursor = start;
  while (cursor <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(addDays(cursor, i));
    }
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

export function sejourTouchesDate(sejour: Sejour, d: Date): boolean {
  const iso = isoOf(d);
  return iso >= sejour.debut && iso < sejour.fin;
}

export type SejourBar = {
  sejour: Sejour;
  colStart: number; // 0-6
  colSpan: number; // 1-7
  row: number;
};

/** Découpe les séjours qui touchent une semaine en barres positionnées (colonne, largeur, ligne). */
export function layoutWeek(week: Date[], sejours: Sejour[]): SejourBar[] {
  const weekStartIso = isoOf(week[0]);
  const weekEndIso = isoOf(addDays(week[6], 1));

  const overlapping = sejours
    .filter((s) => s.fin > weekStartIso && s.debut < weekEndIso)
    .map((s) => {
      const colStart = Math.max(0, week.findIndex((d) => isoOf(d) === s.debut));
      const startInWeek = s.debut <= weekStartIso ? 0 : colStart;
      const endExclusiveIso = s.fin < weekEndIso ? s.fin : weekEndIso;
      let colEnd = week.findIndex((d) => isoOf(d) === endExclusiveIso);
      if (colEnd === -1) colEnd = 7;
      return { sejour: s, colStart: startInWeek, colSpan: Math.max(1, colEnd - startInWeek) };
    })
    .sort((a, b) => a.colStart - b.colStart);

  const rows: { end: number }[] = [];
  const bars: SejourBar[] = [];

  for (const item of overlapping) {
    let rowIndex = rows.findIndex((r) => r.end <= item.colStart);
    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push({ end: item.colStart + item.colSpan });
    } else {
      rows[rowIndex].end = item.colStart + item.colSpan;
    }
    bars.push({ ...item, row: rowIndex });
  }

  return bars;
}

export function sejoursForDay(sejours: Sejour[], d: Date): Sejour[] {
  return sejours.filter((s) => sejourTouchesDate(s, d));
}
