"use client";

import { useEffect } from "react";
import { Icon } from "@/components/Icon";
import { EtatVideIllustration } from "@/components/EtatVideIllustration";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-container px-6 py-12 text-center">
      <EtatVideIllustration icone="luggage" />
      <div className="mt-4 text-2xl font-bold tracking-tight text-on-primary-container">
        Oups, petit imprévu
      </div>
      <p className="mt-2 mb-8 max-w-xs text-sm leading-relaxed text-[#7A5A4E]">
        Quelque chose s&apos;est renversé dans la valise. Un petit coup d&apos;essai de plus ?
      </p>
      <button
        onClick={reset}
        className="flex h-12 items-center gap-2 rounded-full px-6.5 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95"
        style={{ backgroundColor: "var(--md-primary)" }}
      >
        <Icon name="refresh" size={20} />
        Réessayer
      </button>
    </div>
  );
}
