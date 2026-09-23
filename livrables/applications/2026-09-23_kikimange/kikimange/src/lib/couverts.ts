import { rangCreneau, type Creneau } from "./jours";

export const NB_PARENTS = 2;

/** Façon dont les enfants parlent de leurs parents dans l'appli. */
export const PARENTS_LIBELLE = "Papa et Maman";

export function couvertsParticipation(p: { accompagnants: unknown[]; supplementaires: number }): number {
  return 1 + p.accompagnants.length + p.supplementaires;
}

type Absence = { debutDate: string; debutCreneau: Creneau; finDate: string; finCreneau: Creneau };

export function parentsAbsents(absences: Absence[], date: string, creneau: Creneau): boolean {
  const rang = rangCreneau(date, creneau);
  return absences.some(
    (a) => rangCreneau(a.debutDate, a.debutCreneau) <= rang && rang <= rangCreneau(a.finDate, a.finCreneau)
  );
}
