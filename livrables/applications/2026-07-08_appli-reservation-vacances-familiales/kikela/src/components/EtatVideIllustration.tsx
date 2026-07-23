import { Icon } from "./Icon";

type EtatVideIllustrationProps = {
  icone: string;
};

/** Illustration décorative pour les pages d'erreur/404 : icône flottante sur un fond de bulles colorées. */
export function EtatVideIllustration({ icone }: EtatVideIllustrationProps) {
  return (
    <div className="relative mb-2 flex h-40 w-40 items-center justify-center">
      <span
        className="absolute -left-2 top-3 h-16 w-16 rounded-full opacity-70"
        style={{ backgroundColor: "var(--lieu-gedre-container)" }}
      />
      <span
        className="absolute -right-1 bottom-2 h-12 w-12 rounded-full opacity-70"
        style={{ backgroundColor: "var(--lieu-saint-gilles-container)" }}
      />
      <span
        className="absolute right-6 top-0 h-7 w-7 rounded-full opacity-80"
        style={{ backgroundColor: "var(--lieu-bolquere-container)" }}
      />
      <span
        className="relative flex h-24 w-24 rotate-[-8deg] items-center justify-center rounded-[2rem] shadow-sm"
        style={{ backgroundColor: "var(--md-primary-container)" }}
      >
        <Icon name={icone} size={48} style={{ color: "var(--md-primary)" }} />
      </span>
    </div>
  );
}
