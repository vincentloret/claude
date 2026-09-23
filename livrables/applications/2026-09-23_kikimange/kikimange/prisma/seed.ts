import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// Couleurs d'avatar : palette.md §3 (aucun vert, contraste AA avec les initiales blanches).
const membres = [
  { id: "louka", nom: "Louka", initiales: "LO", couleur: "#b90c55", role: "enfant" as const, ordre: 1 },
  { id: "maceo", nom: "Macéo", initiales: "MA", couleur: "#0060a8", role: "enfant" as const, ordre: 2 },
  { id: "pablo", nom: "Pablo", initiales: "PA", couleur: "#b02e00", role: "enfant" as const, ordre: 3 },
  { id: "vincent", nom: "Vincent", initiales: "VI", couleur: "#6f48b2", role: "parent" as const, ordre: 4 },
  { id: "claire", nom: "Claire", initiales: "CL", couleur: "#79564b", role: "parent" as const, ordre: 5 },
];

const plats = [
  "Lasagnes de Papa",
  "Poulet grillé",
  "Couscous",
  "Tajine",
  "Raclette",
  "Côtes de porc aux pommes",
];

async function main() {
  for (const m of membres) {
    await prisma.membre.upsert({ where: { id: m.id }, update: {}, create: m });
  }

  if ((await prisma.platFavori.count()) === 0) {
    await prisma.platFavori.createMany({ data: plats.map((nom, i) => ({ nom, ordre: i })) });
  }

  console.log(`Seed terminé : ${membres.length} membres, ${plats.length} plats favoris.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
