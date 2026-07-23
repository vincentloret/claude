"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Confetti } from "./Confetti";
import { formatPlage, type Lieu, type Foyer, type LieuId } from "@/lib/data";
import { creerSouhait } from "@/lib/actions";

type WishFormProps = {
  lieux: Lieu[];
  foyers: Foyer[];
  foyerConnecteId: string;
  lieuInitial?: LieuId;
  onClose: () => void;
};

export function WishForm({ lieux, foyers, foyerConnecteId, lieuInitial, onClose }: WishFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [lieuId, setLieuId] = useState<LieuId>(lieuInitial ?? lieux[0].id);
  const [debut, setDebut] = useState("2026-08-22");
  const [fin, setFin] = useState("2026-08-28");
  const [foyerId, setFoyerId] = useState(foyerConnecteId);
  const [personnes, setPersonnes] = useState(2);
  const [note, setNote] = useState("");
  const [envoye, setEnvoye] = useState<null | { lieuId: LieuId; debut: string; fin: string }>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!debut || !fin || fin <= debut) return;
    startTransition(async () => {
      const resultat = await creerSouhait({ lieuId, foyerId, debut, fin, personnes, note: note || undefined });
      setEnvoye(resultat);
    });
  }

  if (envoye) {
    const lieu = lieux.find((l) => l.id === envoye.lieuId)!;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-primary-container px-9 py-12 text-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <Confetti />
            <div
              className="animate-pop-in flex h-24 w-24 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--lieu-bolquere)" }}
            >
              <Icon name="check" size={56} className="text-white" />
            </div>
          </div>
          <div className="mt-7 text-2xl font-bold text-on-primary-container">C&apos;est envoyé !</div>
          <div className="mt-3 mb-7 text-base leading-relaxed text-[#7A5A4E]">
            Toute la famille peut voir ton envie pour{" "}
            <b style={{ color: lieu.couleurOnContainer }}>{lieu.nom}</b>, du{" "}
            <b>{formatPlage(envoye.debut, envoye.fin)}</b>. Reste plus qu&apos;à croiser les doigts !
          </div>
          <button
            onClick={() => {
              onClose();
              router.push("/planning");
            }}
            className="mb-2.5 h-13 w-full rounded-full font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95"
            style={{ backgroundColor: "var(--md-primary)" }}
          >
            Voir le planning
          </button>
          <button
            onClick={() => setEnvoye(null)}
            className="h-12 w-full rounded-full text-sm font-medium transition-colors duration-150 hover:bg-white/50"
            style={{ color: "var(--md-primary)" }}
          >
            Poser un autre souhait
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center md:p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface md:max-w-lg md:rounded-3xl"
      >
        <div className="flex items-center gap-3 border-b border-outline-variant px-6 py-5">
          <div className="flex-1 text-xl font-normal">Poser un souhait</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1 transition-transform duration-150 hover:rotate-90 active:scale-90"
          >
            <Icon name="close" size={24} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-3 text-sm font-medium text-on-surface-variant">Lieu</div>
          <div className="mb-6 flex gap-2.5">
            {lieux.map((lieu) => {
              const selected = lieu.id === lieuId;
              return (
                <button
                  type="button"
                  key={lieu.id}
                  onClick={() => setLieuId(lieu.id)}
                  className="relative flex-1 overflow-hidden rounded-2xl text-left transition-transform duration-150 hover:scale-[1.02] active:scale-95"
                  style={{ border: selected ? `2px solid ${lieu.couleur}` : "1.5px solid var(--md-outline-variant)" }}
                >
                  <div
                    className="h-13"
                    style={{ background: `${lieu.couleurContainer}` }}
                  />
                  {selected && (
                    <div
                      className="absolute right-2 top-2 flex h-5.5 w-5.5 items-center justify-center rounded-full"
                      style={{ backgroundColor: lieu.couleur }}
                    >
                      <Icon name="check" size={16} className="text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2.5 py-2">
                    <Icon name={lieu.icone} size={16} style={{ color: lieu.couleur }} />
                    <span className="truncate text-[13px] font-medium">{lieu.nom}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mb-3 text-sm font-medium text-on-surface-variant">Dates du séjour</div>
          <div className="mb-6 flex items-center gap-2.5">
            <label className="flex-1 rounded-xl border border-outline px-3.5 py-2.5">
              <span className="block text-[11px] text-on-surface-variant">Arrivée</span>
              <input
                type="date"
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
                className="w-full bg-transparent text-[15px] outline-none"
                required
              />
            </label>
            <Icon name="arrow_forward" size={20} className="text-on-surface-muted" />
            <label className="flex-1 rounded-xl border border-outline px-3.5 py-2.5">
              <span className="block text-[11px] text-on-surface-variant">Départ</span>
              <input
                type="date"
                value={fin}
                min={debut}
                onChange={(e) => setFin(e.target.value)}
                className="w-full bg-transparent text-[15px] outline-none"
                required
              />
            </label>
          </div>

          <div className="mb-3 text-sm font-medium text-on-surface-variant">Foyer</div>
          <label className="mb-1.5 flex items-center gap-3 rounded-xl border border-outline px-3.5 py-2.5">
            <select
              value={foyerId}
              onChange={(e) => setFoyerId(e.target.value)}
              className="w-full bg-transparent text-[15px] outline-none"
            >
              {foyers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </label>
          <div className="mb-6 pl-0.5 text-xs text-on-surface-muted">Ton foyer · modifiable</div>

          <div className="mb-3 text-sm font-medium text-on-surface-variant">Nombre de personnes</div>
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPersonnes((p) => Math.max(1, p - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-outline transition-all duration-150 hover:border-[var(--md-primary)] hover:bg-primary-container active:scale-90"
            >
              <Icon name="remove" size={22} style={{ color: "var(--md-primary)" }} />
            </button>
            <div className="min-w-8 text-center text-2xl font-medium">{personnes}</div>
            <button
              type="button"
              onClick={() => setPersonnes((p) => Math.min(20, p + 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-outline transition-all duration-150 hover:border-[var(--md-primary)] hover:bg-primary-container active:scale-90"
            >
              <Icon name="add" size={22} style={{ color: "var(--md-primary)" }} />
            </button>
            <span className="ml-1 text-[13px] text-on-surface-muted">adultes &amp; enfants</span>
          </div>

          <div className="mb-3 text-sm font-medium text-on-surface-variant">Note (optionnel)</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : on préfère la 2ᵉ quinzaine d'août si possible."
            className="min-h-19 w-full rounded-xl border border-outline px-3.5 py-3 text-[15px] leading-relaxed outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-outline-variant px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-full px-5 text-sm font-medium transition-colors duration-150 hover:bg-primary-container"
            style={{ color: "var(--md-primary)" }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex h-12 items-center gap-2 rounded-full px-6.5 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            style={{ backgroundColor: "var(--md-primary)" }}
          >
            <Icon name="send" size={20} />
            {isPending ? "Envoi…" : "Envoyer le souhait"}
          </button>
        </div>
      </form>
    </div>
  );
}
