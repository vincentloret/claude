import type { Creneau } from "./jours";

export type Role = "enfant" | "parent";

export type MembreVue = {
  id: string;
  nom: string;
  initiales: string;
  couleur: string;
  role: Role;
};

export type AccompagnantVue = { id: string; nom: string; remarque: string | null };

export type ParticipationVue = {
  id: string;
  membre: MembreVue;
  accompagnants: AccompagnantVue[];
  supplementaires: number;
  partsAEmporter: number;
  plat: { id: string; nom: string } | null;
  envies: string | null;
  commentaire: string | null;
  periode: { id: string; nom: string | null } | null;
};

export type InviteVue = { id: string; nom: string; nombre: number; remarque: string | null };

export type CreneauVue = {
  date: string;
  creneau: Creneau;
  participations: ParticipationVue[];
  invites: InviteVue[];
  ouvert: boolean;
  menuAnnonce: string | null;
  heure: string | null;
  parentsAbsents: boolean;
  couverts: number;
  couvertsParents: number;
};

export type ReponseVue = { membreId: string; neVientPas: boolean; reponduLe: string };

export type EnfantVue = MembreVue & { telephone: string | null };

export type SemaineVue = {
  lundi: string;
  jours: string[];
  creneaux: Record<string, CreneauVue>;
  reponses: ReponseVue[];
  enfants: EnfantVue[];
};

/** Ce qu'un enfant saisit dans la feuille de participation. */
export type SaisieParticipation = {
  date: string;
  creneau: Creneau;
  accompagnantIds: string[];
  supplementaires: number;
  partsAEmporter: number;
  platFavoriId: string | null;
  envies: string;
  commentaire: string;
};
