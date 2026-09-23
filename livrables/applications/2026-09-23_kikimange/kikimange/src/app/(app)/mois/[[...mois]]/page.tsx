import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCreneaux, getMembreConnecte } from "@/lib/queries";
import { ajouterJours, aujourdhui, cleCreneau, CRENEAUX, jourEtMois, lundiDe, momentFamilier, numeroJour } from "@/lib/jours";
import { PARENTS_LIBELLE } from "@/lib/couverts";
import { Icon } from "@/components/Icon";
import { AvatarPile } from "@/components/Avatar";
import type { CreneauVue } from "@/lib/types";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function moisVoisin(annee: number, mois: number, delta: number) {
  const d = new Date(Date.UTC(annee, mois - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function Pastille({ c, moiId, estParent, passe }: { c: CreneauVue; moiId: string; estParent: boolean; passe: boolean }) {
  const moi = !estParent && c.participations.some((p) => p.membre.id === moiId);
  const enfants = c.participations.map((p) => p.membre);
  const autres = c.participations.reduce((s, p) => s + p.accompagnants.length + p.supplementaires, 0) + c.invites.reduce((s, i) => s + i.nombre, 0);
  const fond = moi ? "bg-primary-container text-on-primary-container" : c.parentsAbsents ? "hachures text-away" : enfants.length ? "bg-surface-container-highest" : "bg-surface-container";
  return (
    <span
      className={`flex h-7 min-w-0 items-center gap-1 rounded-full px-1.5 text-xs md:h-8 md:px-2 ${fond} ${c.ouvert ? "ring-2 ring-tertiary" : ""} ${passe ? "opacity-55" : ""}`}
    >
      {c.parentsAbsents && !moi && !enfants.length ? (
        <Icon name="flight_takeoff" size={14} />
      ) : (
        <Icon name={c.creneau === "dejeuner" ? "light_mode" : "dark_mode"} size={14} className={moi ? "" : c.creneau === "dejeuner" ? "text-lunch" : "text-dinner"} />
      )}
      {enfants.length > 0 && (
        <>
          <span className="font-medium md:hidden">{enfants.length}</span>
          <span className="hidden md:inline-flex">
            <AvatarPile membres={enfants} autres={autres} size={20} anneau="transparent" />
          </span>
        </>
      )}
    </span>
  );
}

export default async function MoisPage({ params }: { params: Promise<{ mois?: string[] }> }) {
  const { mois: segments } = await params;
  const auj = aujourdhui();
  const demande = segments?.[0] ?? auj.slice(0, 7);
  if ((segments && segments.length > 1) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(demande)) notFound();
  const [annee, mois] = demande.split("-").map(Number);

  const premier = `${demande}-01`;
  const dernier = ajouterJours(`${moisVoisin(annee, mois, 1)}-01`, -1);
  const debutGrille = lundiDe(premier);
  const finGrille = ajouterJours(lundiDe(dernier), 6);

  const [membre, creneaux, absences, periodesDuMois] = await Promise.all([
    getMembreConnecte(),
    getCreneaux(debutGrille, finGrille),
    prisma.absenceParents.findMany({ where: { debutDate: { lte: dernier }, finDate: { gte: premier } }, orderBy: { debutDate: "asc" } }),
    prisma.periode.findMany({
      where: { debut: { lte: dernier }, fin: { gte: premier } },
      include: { membre: { select: { nom: true } } },
      orderBy: { debut: "asc" },
    }),
  ]);
  const estParent = membre.role === "parent";

  const semaines: string[][] = [];
  for (let d = debutGrille; d <= finGrille; d = ajouterJours(d, 7)) {
    semaines.push(Array.from({ length: 7 }, (_, i) => ajouterJours(d, i)));
  }

  const duMois = Object.values(creneaux).filter((c) => c.date >= premier && c.date <= dernier);
  const mesRepas = duMois.filter((c) => c.participations.some((p) => p.membre.id === membre.id)).length;
  const repasAvecEnfants = duMois.filter((c) => c.participations.length > 0).length;
  const repasOuverts = duMois.filter((c) => c.ouvert);

  const periodes = periodesDuMois.map((p) => ({ id: p.id, nom: p.nom, membre: p.membre.nom, debut: p.debut, fin: p.fin }));

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-4 pt-3 pb-8 md:flex-row md:px-8 md:pt-6">
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-1 pr-14">
          <Link href={`/mois/${moisVoisin(annee, mois, -1)}`} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-surface-container-high" aria-label="Mois précédent">
            <Icon name="chevron_left" />
          </Link>
          <Link href={`/mois/${moisVoisin(annee, mois, 1)}`} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-surface-container-high" aria-label="Mois suivant">
            <Icon name="chevron_right" />
          </Link>
          <div className="ml-1">
            <h1 className="text-[22px] leading-7 md:text-[28px] md:leading-9">
              {MOIS[mois - 1]} {annee}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {estParent ? `${repasAvecEnfants} repas avec les enfants` : `${mesRepas} repas pour toi`} · déjeuner en haut, dîner en bas
            </p>
          </div>
        </header>

        <div className="mt-4 grid grid-cols-7 gap-x-1 text-center text-xs font-medium text-on-surface-variant md:gap-x-2">
          {JOURS.map((j) => (
            <div key={j} className="pb-1">
              <span className="md:hidden">{j[0]}</span>
              <span className="hidden md:inline">{j}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 md:gap-2">
          {semaines.map((jours) => (
            <div key={jours[0]} className="grid grid-cols-7 gap-1 md:gap-2">
              {jours.map((jour) => {
                const horsMois = jour < premier || jour > dernier;
                return (
                  <Link
                    key={jour}
                    href={`/semaine/${lundiDe(jour)}`}
                    className={`flex min-h-[76px] min-w-0 flex-col gap-1 rounded-xl p-1 transition-colors hover:bg-surface-container-low md:min-h-[96px] md:p-1.5 ${horsMois ? "opacity-40" : ""} ${jour === auj ? "ring-2 ring-primary" : ""}`}
                    aria-label={`Ouvrir la semaine du ${jourEtMois(lundiDe(jour))}`}
                  >
                    <span className={`px-1 text-sm ${jour === auj ? "font-bold text-primary" : ""}`}>{numeroJour(jour)}</span>
                    {CRENEAUX.map((cr) => (
                      <Pastille key={cr} c={creneaux[cleCreneau(jour, cr)]} moiId={membre.id} estParent={estParent} passe={jour < auj} />
                    ))}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <p className="mt-3 flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant">
          <Icon name="touch_app" size={18} />
          Touche un jour pour ouvrir sa semaine.
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
          {!estParent && (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded-full bg-primary-container" /> Tu viens
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-full ring-2 ring-tertiary" /> Repas ouvert
          </span>
          <span className="flex items-center gap-1.5">
            <span className="hachures h-3 w-5 rounded-full" /> {estParent ? "Vous êtes absents" : `${PARENTS_LIBELLE} absents`}
          </span>
          <span className="md:hidden">Le chiffre = enfants présents</span>
        </div>
      </div>

      <aside className="flex flex-col gap-3 md:w-80 md:pt-16">
        <h2 className="text-sm font-medium text-on-surface-variant">Temps forts</h2>
        {repasOuverts.length === 0 && absences.length === 0 && periodes.length === 0 && (
          <p className="rounded-2xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">Rien de particulier ce mois-ci.</p>
        )}
        {repasOuverts.map((c) => (
          <Link key={cleCreneau(c.date, c.creneau)} href={`/repas/${c.date}/${c.creneau}`} className="flex items-center gap-3 rounded-2xl bg-tertiary-container px-4 py-3 text-on-tertiary-container">
            <Icon name="restaurant" />
            <span>
              <span className="block font-medium">{c.menuAnnonce ?? "Repas ouvert"}</span>
              <span className="block text-sm first-letter:uppercase">
                {momentFamilier(c.date, c.creneau)} {numeroJour(c.date)} · {c.participations.length ? c.participations.map((p) => p.membre.nom).join(", ") : "personne pour l'instant"}
              </span>
            </span>
          </Link>
        ))}
        {periodes.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-secondary-container px-4 py-3 text-on-secondary-container">
            <Icon name="date_range" />
            <span>
              <span className="block font-medium">{p.nom ?? `Période de ${p.membre}`}</span>
              <span className="block text-sm">
                {p.membre}, du {jourEtMois(p.debut)} au {jourEtMois(p.fin)}
              </span>
            </span>
          </div>
        ))}
        {absences.map((a) => (
          <div key={a.id} className="hachures flex items-center gap-3 rounded-2xl px-4 py-3 text-away">
            <Icon name="flight_takeoff" />
            <span>
              <span className="block font-medium">{a.note ?? (estParent ? "Vous êtes absents" : `${PARENTS_LIBELLE} absents`)}</span>
              <span className="block text-sm first-letter:uppercase">
                {a.debutDate === a.finDate && a.debutCreneau === a.finCreneau
                  ? `${momentFamilier(a.debutDate, a.debutCreneau)} ${numeroJour(a.debutDate)}`
                  : `Du ${momentFamilier(a.debutDate, a.debutCreneau)} ${numeroJour(a.debutDate)} au ${momentFamilier(a.finDate, a.finCreneau)} ${numeroJour(a.finDate)}`}
                {estParent ? "" : " · tu peux venir quand même"}
              </span>
            </span>
          </div>
        ))}
      </aside>
    </div>
  );
}
