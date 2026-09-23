"use client";

import { useState } from "react";
import { Icon } from "./Icon";

/** Partage via le menu du téléphone (WhatsApp, Notes…), ou copie dans le presse-papiers sur ordinateur. */
export function PartagerTexte({ texte }: { texte: string }) {
  const [copie, setCopie] = useState(false);

  async function partager() {
    if (navigator.share) {
      try {
        await navigator.share({ text: texte });
        return;
      } catch {
        // Partage annulé : on ne fait rien.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      // Presse-papiers refusé : rien de plus à proposer.
    }
  }

  return (
    <button onClick={partager} className="flex h-12 items-center gap-2 rounded-full bg-primary px-5 font-medium text-on-primary">
      <Icon name={copie ? "check" : "share"} size={20} />
      {copie ? "Copié" : "Partager"}
    </button>
  );
}
