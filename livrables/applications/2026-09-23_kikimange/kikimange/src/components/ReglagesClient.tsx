"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { PartagerTexte } from "./PartagerTexte";
import {
  ajouterPlat,
  annulerRepasOuvert,
  creerAbsence,
  creerRepasOuvert,
  deplacerPlat,
  modifierMembre,
  retirerPlat,
  supprimerAbsence,
} from "@/lib/actions";
import { jourEtMois, jourLong, momentFamilier, type Creneau } from "@/lib/jours";

export type Onglet = "membres" | "plats" | "absences" | "repas";

type MembreReglage = {
  id: string;
  nom: string;
  initiales: string;
  couleur: string;
  role: "enfant" | "parent";
  telephone: string | null;
  rappelActif: boolean;
  appareils: string[];
  accompagnants: string[];
};

type Absence = { id: string; debutDate: string; debutCreneau: Creneau; finDate: string; finCreneau: Creneau; note: string | null };
type RepasOuvert = { date: string; creneau: Creneau; menu: string | null; heure: string | null; reponses: number };

type Props = {
  ongletInitial: Onglet;
  moiId: string;
  aujourdhui: string;
  codeFamille: string;
  membres: MembreReglage[];
  plats: { id: string; nom: string }[];
  absences: Absence[];
  repasOuverts: RepasOuvert[];
};

const ONGLETS: { id: Onglet; libelle: string; icone: string }[] = [
  { id: "membres", libelle: "Membres", icone: "group" },
  { id: "plats", libelle: "Plats favoris", icone: "restaurant_menu" },
  { id: "absences", libelle: "Absences", icone: "flight_takeoff" },
  { id: "repas", libelle: "Repas ouverts", icone: "restaurant" },
];

function Champ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="block rounded-xl border border-outline bg-surface px-3 pt-1.5 pb-2 focus-within:border-primary">
      <span className="block text-xs text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

function SegmentCreneau({ valeur, onChange, nom }: { valeur: Creneau; onChange: (c: Creneau) => void; nom: string }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-full border border-outline" role="group" aria-label={nom}>
      {(["dejeuner", "diner"] as Creneau[]).map((c, i) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-pressed={valeur === c}
          className={`flex h-11 items-center justify-center gap-1 text-sm font-medium ${i ? "border-l border-outline" : ""} ${valeur === c ? "bg-secondary-container text-on-secondary-container" : ""}`}
        >
          {valeur === c && <Icon name="check" size={16} />}
          {c === "dejeuner" ? "Midi" : "Soir"}
        </button>
      ))}
    </div>
  );
}

function Interrupteur({ actif, onChange, label }: { actif: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      onClick={() => onChange(!actif)}
      className={`relative h-8 w-13 flex-none rounded-full transition-colors ${actif ? "bg-primary" : "border-2 border-outline bg-surface-container-highest"}`}
    >
      <span
        className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full transition-all ${
          actif ? "right-1 h-6 w-6 bg-on-primary text-primary" : "left-1.5 h-4 w-4 bg-outline"
        }`}
      >
        {actif && <Icon name="check" size={16} />}
      </span>
    </button>
  );
}

function LigneMembre({ m, estMoi, executer }: { m: MembreReglage; estMoi: boolean; executer: (f: () => Promise<unknown>) => void }) {
  const [telephone, setTelephone] = useState(m.telephone ?? "");
  const modifie = telephone.trim() !== (m.telephone ?? "");
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-surface-container-low px-4 py-3 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar membre={m} size={40} />
        <div className="min-w-0">
          <div className="font-medium">
            {m.nom}
            {m.role === "parent" && <span className="ml-2 rounded-md bg-surface-container-highest px-1.5 py-0.5 text-xs font-normal">parent{estMoi ? " · toi" : ""}</span>}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs">
            {m.appareils.length ? (
              <span className="flex items-center gap-1 rounded-md bg-primary-container px-1.5 py-0.5 text-on-primary-container">
                <Icon name="notifications_active" size={14} />
                Notifs actives · {[...new Set(m.appareils)].join(", ")}
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-md bg-error-container px-1.5 py-0.5 text-on-error-container">
                <Icon name="notifications_off" size={14} />
                Notifs pas activées
              </span>
            )}
            {m.accompagnants.length > 0 && <span className="text-on-surface-variant">Avec : {m.accompagnants.join(", ")}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Champ id={`tel-${m.id}`} label="Téléphone">
          <input
            id={`tel-${m.id}`}
            type="tel"
            inputMode="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="06 00 00 00 00"
            className="w-36 bg-transparent text-[15px] tabular-nums outline-none"
          />
        </Champ>
        {modifie && (
          <button onClick={() => executer(() => modifierMembre(m.id, { telephone }))} className="h-10 rounded-full bg-primary px-3 text-sm font-medium text-on-primary">
            OK
          </button>
        )}
      </div>
      {m.role === "enfant" && (
        <div className="flex items-center gap-2 md:w-36 md:justify-end">
          <span className="text-sm text-on-surface-variant">Rappel lundi</span>
          <Interrupteur actif={m.rappelActif} label={`Rappel du lundi pour ${m.nom}`} onChange={(v) => executer(() => modifierMembre(m.id, { rappelActif: v }))} />
        </div>
      )}
    </li>
  );
}

function decrireAbsence(a: Absence) {
  if (a.debutDate === a.finDate && a.debutCreneau === a.finCreneau) return `${momentFamilier(a.debutDate, a.debutCreneau)} ${jourEtMois(a.debutDate)}`;
  return `Du ${momentFamilier(a.debutDate, a.debutCreneau)} ${jourEtMois(a.debutDate)} au ${momentFamilier(a.finDate, a.finCreneau)} ${jourEtMois(a.finDate)}`;
}

export function ReglagesClient(props: Props) {
  const { aujourdhui: auj } = props;
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>(props.ongletInitial);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [nouveauPlat, setNouveauPlat] = useState("");
  const [abs, setAbs] = useState({ debutDate: auj, debutCreneau: "dejeuner" as Creneau, finDate: auj, finCreneau: "diner" as Creneau, note: "" });
  const [repas, setRepas] = useState({ date: auj, creneau: "dejeuner" as Creneau, menu: "", heure: "" });
  const [formulaire, setFormulaire] = useState<"absence" | "repas" | null>(null);

  function changerOnglet(o: Onglet) {
    setOnglet(o);
    setErreur(null);
    router.replace(`/reglages?onglet=${o}`, { scroll: false });
  }

  function executer(action: () => Promise<unknown>, apres?: () => void) {
    setErreur(null);
    startTransition(async () => {
      try {
        await action();
        apres?.();
      } catch (e) {
        setErreur(e instanceof Error && e.message ? e.message : "Ça n'a pas marché. Réessaie.");
      }
    });
  }

  const absencesAVenir = props.absences.filter((a) => a.finDate >= auj).reverse();
  const absencesPassees = props.absences.filter((a) => a.finDate < auj);
  const repasAVenir = props.repasOuverts.filter((r) => r.date >= auj).reverse();
  const repasPasses = props.repasOuverts.filter((r) => r.date < auj).slice(0, 5);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 pt-3 pb-8 md:px-8 md:pt-6">
      <header className="flex flex-wrap items-start gap-3 pr-14">
        <div className="flex-1">
          <h1 className="text-[22px] leading-7 md:text-[28px] md:leading-9">Réglages de la famille</h1>
          <p className="text-sm text-on-surface-variant">Seuls Papa et Maman voient cette page.</p>
        </div>
        {props.codeFamille && (
          <div className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-2">
            <div>
              <div className="text-xs text-on-surface-variant">Code famille</div>
              <div className="text-xl tracking-[0.3em] tabular-nums">{props.codeFamille}</div>
            </div>
            <PartagerTexte texte={`Le code famille de Kikimange : ${props.codeFamille}. À saisir une seule fois sur ton téléphone.`} />
          </div>
        )}
      </header>

      <nav className="-mx-4 flex overflow-x-auto border-b border-outline-variant px-4" role="tablist">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            role="tab"
            aria-selected={onglet === o.id}
            onClick={() => changerOnglet(o.id)}
            className={`flex h-12 flex-none items-center gap-1.5 border-b-[3px] px-4 text-sm font-medium ${onglet === o.id ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}
          >
            <Icon name={o.icone} size={18} />
            {o.libelle}
          </button>
        ))}
      </nav>

      {erreur && <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container" role="alert">{erreur}</p>}

      {onglet === "membres" && (
        <section className="flex flex-col gap-2">
          <ul className="flex flex-col gap-2">
            {props.membres.map((m) => (
              <LigneMembre key={m.id} m={m} estMoi={m.id === props.moiId} executer={(f) => executer(f)} />
            ))}
          </ul>
          <p className="flex items-center gap-2 rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
            <Icon name="event_repeat" size={18} />
            Le rappel part le lundi à 11 h à ceux qui n&apos;ont pas encore validé leur semaine. Le téléphone sert aux relances WhatsApp ou SMS.
          </p>
        </section>
      )}

      {onglet === "plats" && (
        <section className="flex flex-col gap-3">
          <p className="text-sm text-on-surface-variant">Les enfants les voient, dans cet ordre, dans « Idée de menu ».</p>
          <ol className="flex flex-col gap-1">
            {props.plats.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2 rounded-xl bg-surface-container-low py-1 pr-1 pl-4">
                <span className="w-5 text-sm text-on-surface-variant tabular-nums">{i + 1}</span>
                <span className="flex-1">{p.nom}</span>
                <button onClick={() => executer(() => deplacerPlat(p.id, -1))} disabled={isPending || i === 0} className="flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30" aria-label={`Monter ${p.nom}`}>
                  <Icon name="arrow_upward" size={20} />
                </button>
                <button onClick={() => executer(() => deplacerPlat(p.id, 1))} disabled={isPending || i === props.plats.length - 1} className="flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30" aria-label={`Descendre ${p.nom}`}>
                  <Icon name="arrow_downward" size={20} />
                </button>
                <button onClick={() => executer(() => retirerPlat(p.id))} disabled={isPending} className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant" aria-label={`Retirer ${p.nom}`}>
                  <Icon name="delete" size={20} />
                </button>
              </li>
            ))}
          </ol>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executer(() => ajouterPlat(nouveauPlat), () => setNouveauPlat(""));
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1">
              <Champ id="nouveau-plat" label="Ajouter un plat">
                <input id="nouveau-plat" value={nouveauPlat} onChange={(e) => setNouveauPlat(e.target.value)} maxLength={60} placeholder="Ex. : blanquette" className="w-full bg-transparent text-[15px] outline-none" />
              </Champ>
            </div>
            <button type="submit" disabled={isPending || !nouveauPlat.trim()} className="flex h-12 items-center gap-1 rounded-full bg-primary px-5 font-medium text-on-primary disabled:opacity-50">
              <Icon name="add" size={20} />
              Ajouter
            </button>
          </form>
        </section>
      )}

      {onglet === "absences" && (
        <section className="flex flex-col gap-3">
          <p className="flex items-center gap-2 rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
            <Icon name="info" size={18} />
            Les enfants peuvent quand même s&apos;inscrire : ils se serviront.
          </p>
          <h2 className="text-sm font-medium text-on-surface-variant">À venir</h2>
          {absencesAVenir.length === 0 && <p className="text-sm text-on-surface-variant">Aucune absence prévue.</p>}
          <ul className="flex flex-col gap-2">
            {absencesAVenir.map((a) => (
              <li key={a.id} className="hachures flex items-center gap-3 rounded-2xl px-4 py-3 text-away">
                <Icon name="flight_takeoff" />
                <div className="flex-1">
                  <div className="font-medium text-on-surface">{a.note ?? "Absence"}</div>
                  <div className="text-sm first-letter:uppercase">{decrireAbsence(a)}</div>
                </div>
                <button onClick={() => executer(() => supprimerAbsence(a.id))} disabled={isPending} className="flex h-11 w-11 items-center justify-center rounded-full" aria-label="Supprimer cette absence">
                  <Icon name="delete" size={20} />
                </button>
              </li>
            ))}
          </ul>

          {formulaire === "absence" ? (
            <div className="space-y-3 rounded-2xl bg-surface-container p-4">
              <Champ id="abs-note" label="Pourquoi (facultatif)">
                <input id="abs-note" value={abs.note} onChange={(e) => setAbs({ ...abs, note: e.target.value })} maxLength={80} placeholder="Ex. : week-end à Paris" className="w-full bg-transparent text-[15px] outline-none" />
              </Champ>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Champ id="abs-debut" label="À partir du">
                    <input id="abs-debut" type="date" value={abs.debutDate} onChange={(e) => setAbs({ ...abs, debutDate: e.target.value, finDate: e.target.value > abs.finDate ? e.target.value : abs.finDate })} className="w-full bg-transparent text-[15px] outline-none" />
                  </Champ>
                  <SegmentCreneau nom="Premier repas" valeur={abs.debutCreneau} onChange={(c) => setAbs({ ...abs, debutCreneau: c })} />
                </div>
                <div className="space-y-2">
                  <Champ id="abs-fin" label="Jusqu'au (inclus)">
                    <input id="abs-fin" type="date" min={abs.debutDate} value={abs.finDate} onChange={(e) => setAbs({ ...abs, finDate: e.target.value })} className="w-full bg-transparent text-[15px] outline-none" />
                  </Champ>
                  <SegmentCreneau nom="Dernier repas" valeur={abs.finCreneau} onChange={(c) => setAbs({ ...abs, finCreneau: c })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setFormulaire(null)} className="h-12 rounded-full px-4 font-medium text-primary">
                  Annuler
                </button>
                <button
                  onClick={() => executer(() => creerAbsence(abs.debutDate, abs.debutCreneau, abs.finDate, abs.finCreneau, abs.note), () => setFormulaire(null))}
                  disabled={isPending}
                  className="h-12 rounded-full bg-primary px-5 font-medium text-on-primary disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setFormulaire("absence")} className="flex h-12 items-center gap-2 self-start rounded-2xl bg-primary px-5 font-medium text-on-primary shadow-sm">
              <Icon name="add" size={20} />
              Signaler une absence
            </button>
          )}

          {absencesPassees.length > 0 && (
            <>
              <h2 className="mt-2 text-sm font-medium text-on-surface-variant">Passées</h2>
              <ul className="flex flex-col gap-1 text-sm text-on-surface-variant">
                {absencesPassees.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center gap-2 px-1">
                    <Icon name="flight_land" size={18} />
                    {a.note ? `${a.note} · ` : ""}
                    <span className="first-letter:uppercase">{decrireAbsence(a)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {onglet === "repas" && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-on-surface-variant">À venir</h2>
          {repasAVenir.length === 0 && <p className="text-sm text-on-surface-variant">Aucun repas ouvert prévu.</p>}
          <ul className="flex flex-col gap-2">
            {repasAVenir.map((r) => (
              <li key={`${r.date}_${r.creneau}`} className="flex items-center gap-3 rounded-2xl bg-tertiary-container px-4 py-3 text-on-tertiary-container">
                <Icon name="restaurant" />
                <div className="flex-1">
                  <div className="font-medium">{r.menu}</div>
                  <div className="text-sm">
                    {jourLong(r.date)} {jourEtMois(r.date)}, {r.creneau === "dejeuner" ? "midi" : "soir"}
                    {r.heure ? ` · ${r.heure}` : ""} · {r.reponses} réponse{r.reponses > 1 ? "s" : ""}
                  </div>
                </div>
                <button onClick={() => executer(() => annulerRepasOuvert(r.date, r.creneau))} disabled={isPending} className="h-10 rounded-full px-3 text-sm font-medium">
                  Annuler
                </button>
              </li>
            ))}
          </ul>

          {formulaire === "repas" ? (
            <div className="space-y-3 rounded-2xl bg-surface-container p-4">
              <Champ id="repas-menu" label="Au menu">
                <input id="repas-menu" value={repas.menu} onChange={(e) => setRepas({ ...repas, menu: e.target.value })} maxLength={60} placeholder="Ex. : raclette" className="w-full bg-transparent text-[15px] outline-none" />
              </Champ>
              <div className="grid gap-3 md:grid-cols-3">
                <Champ id="repas-date" label="Le">
                  <input id="repas-date" type="date" min={auj} value={repas.date} onChange={(e) => setRepas({ ...repas, date: e.target.value })} className="w-full bg-transparent text-[15px] outline-none" />
                </Champ>
                <SegmentCreneau nom="Créneau" valeur={repas.creneau} onChange={(c) => setRepas({ ...repas, creneau: c })} />
                <Champ id="repas-heure" label="Heure (facultatif)">
                  <input id="repas-heure" value={repas.heure} onChange={(e) => setRepas({ ...repas, heure: e.target.value })} maxLength={10} placeholder="Ex. : 12 h 30" className="w-full bg-transparent text-[15px] outline-none" />
                </Champ>
              </div>
              <p className="text-xs text-on-surface-variant">Les enfants dont le rappel est activé recevront une notification.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setFormulaire(null)} className="h-12 rounded-full px-4 font-medium text-primary">
                  Annuler
                </button>
                <button
                  onClick={() => executer(() => creerRepasOuvert(repas.date, repas.creneau, repas.menu, repas.heure), () => {
                    setFormulaire(null);
                    setRepas({ ...repas, menu: "", heure: "" });
                  })}
                  disabled={isPending || !repas.menu.trim()}
                  className="h-12 rounded-full bg-tertiary px-5 font-medium text-white disabled:opacity-50"
                >
                  Lancer l&apos;invitation
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setFormulaire("repas")} className="flex h-12 items-center gap-2 self-start rounded-2xl bg-tertiary-container px-5 font-medium text-on-tertiary-container shadow-sm">
              <Icon name="add" size={20} />
              Créer un repas ouvert
            </button>
          )}

          {repasPasses.length > 0 && (
            <>
              <h2 className="mt-2 text-sm font-medium text-on-surface-variant">Passés</h2>
              <ul className="flex flex-col gap-1 text-sm text-on-surface-variant">
                {repasPasses.map((r) => (
                  <li key={`${r.date}_${r.creneau}`} className="flex items-center gap-2 px-1">
                    <Icon name="restaurant" size={18} />
                    {r.menu} · {jourLong(r.date).toLowerCase()} {jourEtMois(r.date)} · {r.reponses} réponse{r.reponses > 1 ? "s" : ""}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}
