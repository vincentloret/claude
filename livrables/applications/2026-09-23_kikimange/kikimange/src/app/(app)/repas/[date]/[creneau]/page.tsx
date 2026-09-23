import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreneau, getMembreConnecte } from "@/lib/queries";
import { estIsoValide, jourEtMois, jourLong, libelleCreneau, lundiDe, type Creneau } from "@/lib/jours";
import { PARENTS_LIBELLE } from "@/lib/couverts";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { IconeCreneau } from "@/components/Slot";
import { InvitesParents } from "@/components/InvitesParents";

export default async function RepasPage({ params }: { params: Promise<{ date: string; creneau: string }> }) {
  const { date, creneau } = await params;
  if (!estIsoValide(date) || (creneau !== "dejeuner" && creneau !== "diner")) notFound();
  const cr = creneau as Creneau;
  const [membre, c] = await Promise.all([getMembreConnecte(), getCreneau(date, cr)]);
  const estParent = membre.role === "parent";
  const moi = c.participations.find((p) => p.membre.id === membre.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pt-3 pb-8 md:pt-6">
      <header className="flex items-center gap-2 pr-14">
        <Link href={`/semaine/${lundiDe(date)}`} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-surface-container-high" aria-label="Retour à la semaine">
          <Icon name="arrow_back" />
        </Link>
        <h1 className="text-[22px] leading-7">
          {jourLong(date)} {jourEtMois(date)}
        </h1>
      </header>

      <section className={`rounded-[28px] px-5 py-4 ${c.ouvert ? "bg-tertiary-container text-on-tertiary-container" : c.parentsAbsents ? "hachures text-away" : "bg-surface-container"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium ${cr === "dejeuner" ? "bg-lunch-container text-lunch" : "bg-dinner-container text-dinner"}`}>
            <IconeCreneau creneau={cr} size={16} />
            {libelleCreneau(cr)}
            {c.heure ? ` · ${c.heure}` : ""}
          </span>
          {c.ouvert && (
            <span className="flex h-7 items-center gap-1 rounded-full bg-tertiary px-2.5 text-xs font-medium text-white">
              <Icon name="restaurant" size={14} />
              Repas ouvert
            </span>
          )}
          {c.parentsAbsents && (
            <span className="flex h-7 items-center gap-1 rounded-full bg-away-container px-2.5 text-xs font-medium">
              <Icon name="flight_takeoff" size={14} />
              {estParent ? "Vous êtes absents" : `${PARENTS_LIBELLE} absents`}
            </span>
          )}
        </div>
        {c.menuAnnonce && <div className="mt-3 text-[28px] leading-9">{c.menuAnnonce}</div>}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl tabular-nums">{c.couverts}</span>
          <span>
            couvert{c.couverts > 1 ? "s" : ""}
            {c.couvertsParents > 0 ? (estParent ? `, dont vous ${c.couvertsParents}` : `, dont ${PARENTS_LIBELLE}`) : ""}
          </span>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-on-surface-variant">Qui vient</h2>
        {c.participations.length === 0 && c.couvertsParents === 0 ? (
          <p className="rounded-2xl bg-surface-container-low px-4 py-4 text-on-surface-variant">Personne pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-outline-variant rounded-2xl bg-surface-container-low px-4">
            {c.participations.map((p) => {
              const nb = 1 + p.accompagnants.length + p.supplementaires;
              return (
                <li key={p.id} className="flex gap-3 py-3">
                  <Avatar membre={p.membre} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {p.membre.nom}
                      {p.membre.id === membre.id && <span className="font-normal text-on-surface-variant"> (toi)</span>}
                      {p.accompagnants.length > 0 && <span className="font-normal"> avec {p.accompagnants.map((a) => a.nom).join(", ")}</span>}
                      {p.supplementaires > 0 && <span className="font-normal"> +{p.supplementaires}</span>}
                    </div>
                    {p.accompagnants.some((a) => a.remarque) && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {p.accompagnants
                          .filter((a) => a.remarque)
                          .map((a) => (
                            <span key={a.id} className="flex items-center gap-1 rounded-md bg-tertiary-container px-2 py-0.5 text-xs text-on-tertiary-container">
                              <Icon name="eco" size={14} />
                              {a.nom} : {a.remarque}
                            </span>
                          ))}
                      </div>
                    )}
                    <div className="mt-1 space-y-0.5 text-sm text-on-surface-variant">
                      {p.plat && (
                        <div className="flex items-center gap-1.5">
                          <Icon name="restaurant_menu" size={16} /> Idée : {p.plat.nom}
                        </div>
                      )}
                      {p.envies && (
                        <div className="flex items-center gap-1.5">
                          <Icon name="favorite" size={16} /> Envie : {p.envies}
                        </div>
                      )}
                      {p.partsAEmporter > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Icon name="takeout_dining" size={16} /> {p.partsAEmporter} part{p.partsAEmporter > 1 ? "s" : ""} à emporter
                        </div>
                      )}
                      {p.commentaire && (
                        <div className="flex items-center gap-1.5">
                          <Icon name="chat_bubble" size={16} /> {p.commentaire}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm tabular-nums text-on-surface-variant">{nb}</span>
                </li>
              );
            })}
            {c.couvertsParents > 0 && (
              <li className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant">
                  <Icon name="home" size={20} />
                </span>
                <div className="flex-1">
                  <div className="font-medium">{estParent ? "Vous" : PARENTS_LIBELLE}</div>
                  <div className="text-sm text-on-surface-variant">À la maison</div>
                </div>
                <span className="text-sm tabular-nums text-on-surface-variant">{c.couvertsParents}</span>
              </li>
            )}
          </ul>
        )}
      </section>

      <InvitesParents date={date} creneau={cr} invites={c.invites} estParent={estParent} />

      {!estParent && (
        <Link href={`/semaine/${lundiDe(date)}`} className="flex h-12 items-center justify-center gap-2 rounded-full border border-outline font-medium text-primary">
          <Icon name="edit" size={20} />
          {moi ? "Modifier ma participation" : "Je viens, depuis ma semaine"}
        </Link>
      )}
    </div>
  );
}
