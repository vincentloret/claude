// Applique sur Turso les migrations Prisma pas encore passées (la CLI Prisma ne gère pas les URL libsql://).
// Usage : DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… node prisma/migrer-turso.mjs
// Les migrations appliquées sont notées dans la table _migrations_turso.
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
if (!url?.startsWith("libsql://")) {
  console.error("DATABASE_URL doit être une adresse libsql:// (Turso).");
  process.exit(1);
}

const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
await client.execute("CREATE TABLE IF NOT EXISTS _migrations_turso (nom TEXT PRIMARY KEY, appliqueeLe TEXT NOT NULL)");
const dejaFaites = new Set((await client.execute("SELECT nom FROM _migrations_turso")).rows.map((r) => r.nom));

const dossier = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "migrations");
const migrations = fs
  .readdirSync(dossier, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let nb = 0;
for (const nom of migrations) {
  if (dejaFaites.has(nom)) continue;
  const sql = fs.readFileSync(path.join(dossier, nom, "migration.sql"), "utf8");
  await client.executeMultiple(sql);
  await client.execute({ sql: "INSERT INTO _migrations_turso (nom, appliqueeLe) VALUES (?, ?)", args: [nom, new Date().toISOString()] });
  console.log(`Appliquée : ${nom}`);
  nb++;
}
console.log(nb ? `${nb} migration(s) appliquée(s).` : "Base déjà à jour.");
client.close();
