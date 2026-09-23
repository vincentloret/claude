import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMembreConnecte } from "@/lib/queries";
import { aujourdhui } from "@/lib/jours";
import { ReglagesClient, type Onglet } from "@/components/ReglagesClient";

const ONGLETS: Onglet[] = ["membres", "plats", "absences", "repas"];

export default async function ReglagesPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const membre = await getMembreConnecte();
  if (membre.role !== "parent") redirect("/semaine");
  const { onglet } = await searchParams;
  const auj = aujourdhui();

  const [membres, plats, absences, repasOuverts] = await Promise.all([
    prisma.membre.findMany({
      orderBy: { ordre: "asc" },
      include: { abonnements: { select: { appareil: true } }, accompagnants: { where: { archive: false }, select: { nom: true } } },
    }),
    prisma.platFavori.findMany({ where: { actif: true }, orderBy: { ordre: "asc" }, select: { id: true, nom: true } }),
    prisma.absenceParents.findMany({ orderBy: { debutDate: "desc" }, take: 30 }),
    prisma.repas.findMany({
      where: { ouvert: true },
      orderBy: { date: "desc" },
      take: 30,
      include: { invites: { select: { nombre: true } } },
    }),
  ]);
  const participationsOuverts = await prisma.participation.groupBy({
    by: ["date", "creneau"],
    where: { OR: repasOuverts.map((r) => ({ date: r.date, creneau: r.creneau })) },
    _count: { _all: true },
  });

  return (
    <ReglagesClient
      ongletInitial={ONGLETS.includes(onglet as Onglet) ? (onglet as Onglet) : "membres"}
      moiId={membre.id}
      aujourdhui={auj}
      codeFamille={process.env.FAMILLE_CODE ?? ""}
      membres={membres.map((m) => ({
        id: m.id,
        nom: m.nom,
        initiales: m.initiales,
        couleur: m.couleur,
        role: m.role,
        telephone: m.telephone,
        rappelActif: m.rappelActif,
        appareils: m.abonnements.map((a) => a.appareil ?? "Appareil"),
        accompagnants: m.accompagnants.map((a) => a.nom),
      }))}
      plats={plats}
      absences={absences.map((a) => ({ id: a.id, debutDate: a.debutDate, debutCreneau: a.debutCreneau, finDate: a.finDate, finCreneau: a.finCreneau, note: a.note }))}
      repasOuverts={repasOuverts.map((r) => ({
        date: r.date,
        creneau: r.creneau,
        menu: r.menuAnnonce,
        heure: r.heure,
        reponses: participationsOuverts.find((p) => p.date === r.date && p.creneau === r.creneau)?._count._all ?? 0,
      }))}
    />
  );
}
