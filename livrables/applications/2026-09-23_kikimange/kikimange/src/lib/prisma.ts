// En production (Turso, URL libsql://), variante "web" de l'adaptateur : fetch, sans dépendances natives,
// nécessaire dans les fonctions serverless Netlify. En local (URL file:), variante Node, seule capable
// d'ouvrir un fichier SQLite ; chargée par un require caché aux bundlers pour ne jamais partir en production.
import { PrismaLibSql as PrismaLibSqlWeb } from "@prisma/adapter-libsql/web";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL!;
  const config = { url, authToken: process.env.DATABASE_AUTH_TOKEN };

  if (url.startsWith("file:")) {
    const nodeRequire = eval("require") as NodeJS.Require;
    const { PrismaLibSql } = nodeRequire("@prisma/adapter-libsql") as typeof import("@prisma/adapter-libsql");
    return new PrismaClient({ adapter: new PrismaLibSql(config) });
  }

  return new PrismaClient({ adapter: new PrismaLibSqlWeb(config) });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
