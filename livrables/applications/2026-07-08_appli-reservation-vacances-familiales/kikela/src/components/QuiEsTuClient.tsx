"use client";

import { useState } from "react";
import { choisirFoyer } from "@/lib/actions";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import type { Foyer } from "@/lib/data";

const MESSAGES_ERREUR: Record<string, string> = {
  code: "Code famille incorrect. Redemande-le à un proche si tu l'as oublié.",
};

export function QuiEsTuClient({ foyers, erreur }: { foyers: Foyer[]; erreur?: string }) {
  const [code, setCode] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-container px-6 py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--md-primary)" }}>
        <Icon name="holiday_village" size={30} className="text-white" />
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-on-primary-container">Kikela</div>
      <div className="mt-1 mb-1 text-center text-lg font-medium text-on-primary-container">Salut, c&apos;est qui ?</div>
      <div className="mb-6 text-center text-sm text-[#7A5A4E]">Code famille, puis clique sur ton foyer</div>

      {erreur && (
        <div className="mb-5 w-full max-w-xs rounded-xl bg-red-50 px-3.5 py-2.5 text-center text-sm text-red-700">
          {MESSAGES_ERREUR[erreur] ?? "Une erreur est survenue."}
        </div>
      )}

      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code famille"
        className="mb-6 w-full max-w-xs rounded-xl border border-outline bg-white px-4 py-3 text-center text-lg tracking-[0.3em] outline-none"
      />

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {foyers.map((foyer) => (
          <form key={foyer.id} action={choisirFoyer}>
            <input type="hidden" name="foyerId" value={foyer.id} />
            <input type="hidden" name="code" value={code} />
            <button
              type="submit"
              className="flex w-full flex-col items-center gap-2 rounded-2xl bg-white px-4 py-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              <Avatar foyer={foyer} size={44} />
              <span className="text-center text-sm font-medium">{foyer.nom}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
