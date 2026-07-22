-- AlterTable
ALTER TABLE "Lieu" ADD COLUMN "googleCalendarId" TEXT;

-- CreateTable
CREATE TABLE "GoogleConnection" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "connecteLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sejour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lieuId" TEXT NOT NULL,
    "foyerId" TEXT,
    "debut" DATETIME NOT NULL,
    "fin" DATETIME NOT NULL,
    "personnes" INTEGER,
    "statut" TEXT NOT NULL,
    "note" TEXT,
    "googleEventId" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sejour_lieuId_fkey" FOREIGN KEY ("lieuId") REFERENCES "Lieu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sejour_foyerId_fkey" FOREIGN KEY ("foyerId") REFERENCES "Foyer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Sejour" ("creeLe", "debut", "fin", "foyerId", "id", "lieuId", "note", "personnes", "statut") SELECT "creeLe", "debut", "fin", "foyerId", "id", "lieuId", "note", "personnes", "statut" FROM "Sejour";
DROP TABLE "Sejour";
ALTER TABLE "new_Sejour" RENAME TO "Sejour";
CREATE UNIQUE INDEX "Sejour_googleEventId_key" ON "Sejour"("googleEventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
