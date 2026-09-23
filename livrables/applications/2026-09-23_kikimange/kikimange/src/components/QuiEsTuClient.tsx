"use client";

import { useState } from "react";
import { choisirMembre } from "@/lib/actions";
import { Avatar } from "./Avatar";
import { BrandMark } from "./BrandMark";
import { Icon } from "./Icon";
import type { MembreVue } from "@/lib/types";

const MESSAGES_ERREUR: Record<string, string> = {
  code: "Ce code ne marche pas. Demande-le à Papa ou Maman.",
};

function CarteMembre({ membre, code }: { membre: MembreVue; code: string }) {
  return (
    <form action={choisirMembre}>
      <input type="hidden" name="membreId" value={membre.id} />
      <input type="hidden" name="code" value={code} />
      <button
        type="submit"
        className="flex w-full flex-col items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
      >
        <Avatar membre={membre} size={48} />
        <span className="text-sm font-medium">{membre.nom}</span>
      </button>
    </form>
  );
}

export function QuiEsTuClient({ membres, erreur }: { membres: MembreVue[]; erreur?: string }) {
  const [code, setCode] = useState("");
  const enfants = membres.filter((m) => m.role === "enfant");
  const parents = membres.filter((m) => m.role === "parent");

  return (
    <div className="flex min-h-screen flex-col items-center bg-primary-container px-4 py-10 md:justify-center">
      <BrandMark size={64} />
      <h1 className="mt-4 text-4xl text-on-primary-container">Kikimange</h1>
      <p className="mt-1 text-center text-on-primary-container">Qui vient manger à la maison ?</p>

      <div className="mt-8 w-full max-w-md rounded-[28px] bg-surface p-5 shadow-sm md:p-6">
        <label htmlFor="code-famille" className="text-sm font-medium">
          Code famille
        </label>
        <input
          id="code-famille"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="••••"
          className={`mt-2 w-full rounded-xl border-2 bg-surface-container-lowest px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-primary ${
            erreur ? "border-error" : "border-outline"
          }`}
        />
        {erreur && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-error" role="alert">
            <Icon name="error" size={18} />
            {MESSAGES_ERREUR[erreur] ?? "Une erreur est survenue."}
          </p>
        )}

        <h2 className="mt-6 text-lg">Qui es-tu ?</h2>
        <p className="text-sm text-on-surface-variant">Touche ton prénom. On s&apos;en souviendra sur cet appareil.</p>

        <div className="mt-4 text-xs font-medium tracking-wide text-on-surface-variant uppercase">Les enfants</div>
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          {enfants.map((m) => (
            <CarteMembre key={m.id} membre={m} code={code} />
          ))}
        </div>

        <div className="mt-4 text-xs font-medium tracking-wide text-on-surface-variant uppercase">Les parents</div>
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          {parents.map((m) => (
            <CarteMembre key={m.id} membre={m} code={code} />
          ))}
        </div>
      </div>
    </div>
  );
}
