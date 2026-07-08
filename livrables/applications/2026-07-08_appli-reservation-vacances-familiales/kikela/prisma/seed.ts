import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const lieux = [
  {
    id: "bolquere",
    slug: "bolquere",
    nom: "Bolquère",
    region: "Pyrénées-Orientales · montagne",
    ambiance: "montagne" as const,
    couleur: "var(--lieu-bolquere)",
    couleurContainer: "var(--lieu-bolquere-container)",
    couleurOnContainer: "var(--lieu-bolquere-on-container)",
    icone: "apartment",
    capacite: 6,
    chambres: 3,
    description:
      "Appartement au pied des pistes, dans un village calme des Pyrénées-Orientales. Idéal pour les séjours au ski en hiver et les randonnées en été.",
    equipements: [
      { icone: "wifi", label: "Wifi fibre" },
      { icone: "local_parking", label: "Parking privé" },
      { icone: "ac_unit", label: "Proche pistes de ski" },
      { icone: "local_laundry_service", label: "Lave-linge" },
      { icone: "kitchen", label: "Cuisine équipée" },
      { icone: "balcony", label: "Balcon vue montagne" },
    ],
  },
  {
    id: "gedre",
    slug: "gedre",
    nom: "Gèdre",
    region: "Hautes-Pyrénées · proche cirque de Gavarnie",
    ambiance: "montagne" as const,
    couleur: "var(--lieu-gedre)",
    couleurContainer: "var(--lieu-gedre-container)",
    couleurOnContainer: "var(--lieu-gedre-on-container)",
    icone: "cottage",
    capacite: 10,
    chambres: 5,
    description:
      "Grande maison familiale à deux pas du cirque de Gavarnie. Parfaite pour les grandes tablées, avec un jardin et une cheminée pour les soirées fraîches.",
    equipements: [
      { icone: "wifi", label: "Wifi fibre" },
      { icone: "local_parking", label: "Parking privé" },
      { icone: "fireplace", label: "Cheminée" },
      { icone: "yard", label: "Jardin" },
      { icone: "local_laundry_service", label: "Lave-linge" },
      { icone: "kitchen", label: "Cuisine équipée" },
    ],
  },
  {
    id: "saint-gilles",
    slug: "saint-gilles",
    nom: "Saint-Gilles-Croix-de-Vie",
    region: "Vendée · bord de mer",
    ambiance: "mer" as const,
    couleur: "var(--lieu-saint-gilles)",
    couleurContainer: "var(--lieu-saint-gilles-container)",
    couleurOnContainer: "var(--lieu-saint-gilles-on-container)",
    icone: "waves",
    capacite: 8,
    chambres: 4,
    description:
      "Maison familiale à deux pas de la plage, avec jardin clos et terrasse plein sud. Idéale pour les grandes tablées et les étés en tribu. Marché et port de pêche à 10 minutes à pied.",
    equipements: [
      { icone: "wifi", label: "Wifi fibre" },
      { icone: "local_parking", label: "Parking privé" },
      { icone: "yard", label: "Jardin clos" },
      { icone: "deck", label: "Terrasse" },
      { icone: "local_laundry_service", label: "Lave-linge" },
      { icone: "kitchen", label: "Cuisine équipée" },
      { icone: "tv", label: "TV / Netflix" },
      { icone: "beach_access", label: "Plage à 300 m" },
    ],
  },
];

const foyers = [
  { id: "pm", nom: "Papy Mamie", initiales: "PM", couleur: "#7A5B2E" },
  { id: "cv", nom: "Claire & Vincent", initiales: "CV", couleur: "#6D4C7D" },
  { id: "cl", nom: "Clara & Louka", initiales: "CL", couleur: "#B4632E" },
  { id: "cm", nom: "Carole & Marc", initiales: "CM", couleur: "#4A6D8C" },
  { id: "j", nom: "Juliette", initiales: "J", couleur: "#8C5A5A" },
  { id: "is", nom: "Isabelle & Sébastien", initiales: "IS", couleur: "#5E6B3E" },
  { id: "mc", nom: "Michael & Christelle", initiales: "MC", couleur: "#3D6B4A" },
];

const sejours = [
  { lieuId: "bolquere", foyerId: "pm", debut: "2026-08-03", fin: "2026-08-09", personnes: 2, statut: "confirme" as const },
  { lieuId: "gedre", foyerId: "cv", debut: "2026-08-08", fin: "2026-08-14", personnes: 4, statut: "confirme" as const },
  { lieuId: "saint-gilles", foyerId: "mc", debut: "2026-08-10", fin: "2026-08-16", personnes: 5, statut: "confirme" as const },
  { lieuId: "saint-gilles", foyerId: "cl", debut: "2026-08-15", fin: "2026-08-16", personnes: 3, statut: "souhait" as const, note: "Créneau déjà réservé — à confirmer entre foyers." },
  { lieuId: "gedre", foyerId: "cm", debut: "2026-08-17", fin: "2026-08-23", personnes: 4, statut: "souhait" as const, note: "2ᵉ quinzaine idéale" },
  { lieuId: "bolquere", foyerId: "j", debut: "2026-08-22", fin: "2026-08-28", personnes: 1, statut: "souhait" as const },
  { lieuId: "saint-gilles", foyerId: "is", debut: "2026-08-24", fin: "2026-08-30", personnes: 4, statut: "souhait" as const },
];

async function main() {
  await prisma.sejour.deleteMany();
  await prisma.equipement.deleteMany();
  await prisma.lieu.deleteMany();
  await prisma.foyer.deleteMany();

  for (const { equipements, ...lieu } of lieux) {
    await prisma.lieu.create({
      data: {
        ...lieu,
        equipements: {
          create: equipements.map((e, ordre) => ({ ...e, ordre })),
        },
      },
    });
  }

  for (const foyer of foyers) {
    await prisma.foyer.create({ data: foyer });
  }

  for (const s of sejours) {
    await prisma.sejour.create({
      data: {
        lieuId: s.lieuId,
        foyerId: s.foyerId,
        debut: new Date(`${s.debut}T00:00:00`),
        fin: new Date(`${s.fin}T00:00:00`),
        personnes: s.personnes,
        statut: s.statut,
        note: s.note,
      },
    });
  }

  console.log(`Seed OK : ${lieux.length} lieux, ${foyers.length} foyers, ${sejours.length} séjours.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
