import { Icon } from "./Icon";

/** Écran provisoire pour les parties encore en construction (itération 2). */
export function BientotDisponible({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 pt-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lunch-container text-lunch">
        <Icon name="bakery_dining" size={32} />
      </span>
      <h1 className="text-[22px]">{titre}</h1>
      <p className="text-on-surface-variant">{texte}</p>
    </div>
  );
}
