"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { Slot, type SlotAffichage } from "./Slot";
import { EnTeteSemaine } from "./EnTeteSemaine";
import { aujourdhui, cleCreneau, CRENEAUX, jourCourt, momentFamilier, numeroJour } from "@/lib/jours";
import type { CreneauVue, EnfantVue, SemaineVue } from "@/lib/types";

function affichage(c: CreneauVue, auj: string): SlotAffichage {
  return {
    creneau: c.creneau,
    presents: c.participations.map((p) => p.membre),
    autres:
      c.participations.reduce((s, p) => s + p.accompagnants.length + p.supplementaires, 0) +
      c.invites.reduce((s, i) => s + i.nombre, 0),
    couverts: c.couverts,
    couvertsParents: c.couvertsParents,
    parentsAbsents: c.parentsAbsents,
    ouvert: c.ouvert,
    menuAnnonce: c.menuAnnonce,
    moi: false,
    passe: c.date < auj,
    periode: false,
  };
}

/** « 06 39 98 12 04 » → « 33639981204 » pour wa.me */
function numeroInternational(tel: string): string {
  const chiffres = tel.replace(/[^\d+]/g, "");
  if (chiffres.startsWith("+")) return chiffres.slice(1);
  if (chiffres.startsWith("0")) return `33${chiffres.slice(1)}`;
  return chiffres;
}

function MenuRelance({ enfant }: { enfant: EnfantVue }) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    function clic(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false);
    }
    document.addEventListener("mousedown", clic);
    return () => document.removeEventListener("mousedown", clic);
  }, [ouvert]);

  if (!enfant.telephone) {
    return <span className="text-xs text-on-surface-variant">Pas de numéro</span>;
  }

  // Le menu ne s’affiche qu’au clic, donc toujours côté navigateur : window est disponible.
  const origine = ouvert ? window.location.origin : "";
  const message = `Coucou ${enfant.nom} ! Tu viens manger à la maison cette semaine ? Dis-le sur Kikimange : ${origine}/semaine`;
  const texte = encodeURIComponent(message);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOuvert((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-full bg-secondary-container px-4 text-sm font-medium text-on-secondary-container"
        aria-expanded={ouvert}
      >
        <Icon name="notifications_active" size={18} />
        Relancer
      </button>
      {ouvert && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-30 w-64 overflow-hidden rounded-xl bg-surface-container shadow-lg">
          <div className="px-4 pt-3 pb-1 text-xs text-on-surface-variant">Relancer {enfant.nom} par…</div>
          <a href={`https://wa.me/${numeroInternational(enfant.telephone)}?text=${texte}`} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center gap-3 px-4 hover:bg-surface-container-high">
            <Icon name="chat" size={20} className="text-on-surface-variant" />
            WhatsApp
          </a>
          <a href={`sms:${enfant.telephone.replace(/\s/g, "")}?&body=${texte}`} className="flex h-12 items-center gap-3 px-4 hover:bg-surface-container-high">
            <Icon name="sms" size={20} className="text-on-surface-variant" />
            SMS
          </a>
          <p className="border-t border-outline-variant px-4 py-2 text-xs text-on-surface-variant">Le message est prêt, il ne reste qu&apos;à l&apos;envoyer.</p>
        </div>
      )}
    </div>
  );
}

export function SemaineParent({ semaine }: { semaine: SemaineVue }) {
  const auj = aujourdhui();
  const creneaux = Object.values(semaine.creneaux);
  const totalCouverts = creneaux.reduce((s, c) => s + c.couverts, 0);
  const totalParents = creneaux.reduce((s, c) => s + c.couvertsParents, 0);
  const repasAvecEnfants = creneaux.filter((c) => c.participations.length > 0).length;
  const partsAEmporter = creneaux.reduce((s, c) => s + c.participations.reduce((t, p) => t + p.partsAEmporter, 0), 0);
  const nbReponses = semaine.enfants.filter((e) => semaine.reponses.some((r) => r.membreId === e.id)).length;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pt-3 md:px-8 md:pt-6">
      <EnTeteSemaine
        lundi={semaine.lundi}
        sousTitre={`${nbReponses} enfant${nbReponses > 1 ? "s" : ""} sur ${semaine.enfants.length} ${nbReponses > 1 ? "ont" : "a"} répondu · ${totalCouverts} couverts, dont vous ${totalParents}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/reglages?onglet=absences" className="flex h-10 items-center gap-1.5 rounded-full border border-outline px-4 text-sm font-medium text-primary">
              <Icon name="flight_takeoff" size={18} />
              Signaler une absence
            </Link>
            <Link href="/reglages?onglet=repas" className="flex h-10 items-center gap-1.5 rounded-full bg-tertiary px-4 text-sm font-medium text-white">
              <Icon name="restaurant" size={18} />
              Créer un repas ouvert
            </Link>
          </div>
        }
      />

      <section className="grid gap-2 md:grid-cols-3" aria-label="Qui a répondu">
        {semaine.enfants.map((e) => {
          const reponse = semaine.reponses.find((r) => r.membreId === e.id);
          const repas = creneaux.filter((c) => c.participations.some((p) => p.membre.id === e.id));
          const enPeriode = repas.some((c) => c.participations.some((p) => p.membre.id === e.id && p.periode));
          return (
            <div key={e.id} className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-3 py-2.5">
              <span className="relative">
                <Avatar membre={e} size={40} />
                <span className={`absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface-container-low ${reponse ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"}`}>
                  <Icon name={reponse ? "check" : "more_horiz"} size={12} />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">
                  {e.nom}
                  {reponse ? (reponse.neVientPas ? " ne vient pas" : " a répondu") : ", en attente"}
                </div>
                <div className="truncate text-xs text-on-surface-variant">
                  {reponse
                    ? reponse.neVientPas
                      ? "Pas cette semaine"
                      : `${repas.length} repas`
                    : enPeriode
                      ? "Période en cours, à confirmer"
                      : "Pas encore validé sa semaine"}
                </div>
              </div>
              {!reponse && <MenuRelance enfant={e} />}
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-3 gap-2 md:max-w-xl" aria-label="Chiffres de la semaine">
        {[
          { valeur: repasAvecEnfants, libelle: "repas avec les enfants" },
          { valeur: totalCouverts, libelle: `couverts, dont vous ${totalParents}` },
          { valeur: partsAEmporter, libelle: "parts à emporter" },
        ].map((s) => (
          <div key={s.libelle} className="rounded-2xl bg-surface-container-low px-3 py-2.5">
            <div className="text-2xl tabular-nums">{s.valeur}</div>
            <div className="text-xs text-on-surface-variant">{s.libelle}</div>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-2 md:hidden">
        {semaine.jours.map((jour) => (
          <div key={jour} className="flex items-stretch gap-2">
            <div className="flex w-11 flex-none flex-col items-center justify-center">
              <span className="text-xs font-medium uppercase text-on-surface-variant">{jourCourt(jour)}</span>
              <span className={`text-2xl ${jour === auj ? "font-medium text-primary" : ""}`}>{numeroJour(jour)}</span>
            </div>
            {CRENEAUX.map((cr) => {
              const c = semaine.creneaux[cleCreneau(jour, cr)];
              return <Slot key={cr} slot={affichage(c, auj)} vue="parent" href={`/repas/${jour}/${cr}`} ariaLabel={`Détail du repas, ${momentFamilier(jour, cr)}`} className="flex-1" />;
            })}
          </div>
        ))}
      </div>

      <div className="hidden grid-cols-[88px_repeat(7,minmax(0,1fr))] gap-2 pb-8 md:grid">
        <div />
        {semaine.jours.map((jour) => (
          <div key={jour} className="flex items-baseline gap-1.5 px-1 pb-1">
            <span className="text-xs font-medium uppercase text-on-surface-variant">{jourCourt(jour)}</span>
            <span className={`text-xl ${jour === auj ? "font-medium text-primary" : ""}`}>{numeroJour(jour)}</span>
          </div>
        ))}
        {CRENEAUX.map((cr) => (
          <div key={cr} className="contents">
            <div className="flex flex-col items-center justify-center gap-1 text-sm text-on-surface-variant">
              <Icon name={cr === "dejeuner" ? "light_mode" : "dark_mode"} className={cr === "dejeuner" ? "text-lunch" : "text-dinner"} />
              {cr === "dejeuner" ? "Déjeuner" : "Dîner"}
            </div>
            {semaine.jours.map((jour) => {
              const c = semaine.creneaux[cleCreneau(jour, cr)];
              return <Slot key={jour} slot={affichage(c, auj)} vue="parent" href={`/repas/${jour}/${cr}`} ariaLabel={`Détail du repas, ${momentFamilier(jour, cr)}`} className="min-h-[120px]" />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
