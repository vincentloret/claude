-- CreateTable
CREATE TABLE "Lieu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "ambiance" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "couleurContainer" TEXT NOT NULL,
    "couleurOnContainer" TEXT NOT NULL,
    "icone" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL,
    "chambres" INTEGER NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Equipement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "icone" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "lieuId" TEXT NOT NULL,
    CONSTRAINT "Equipement_lieuId_fkey" FOREIGN KEY ("lieuId") REFERENCES "Lieu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Foyer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "initiales" TEXT NOT NULL,
    "couleur" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Sejour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lieuId" TEXT NOT NULL,
    "foyerId" TEXT NOT NULL,
    "debut" DATETIME NOT NULL,
    "fin" DATETIME NOT NULL,
    "personnes" INTEGER NOT NULL,
    "statut" TEXT NOT NULL,
    "note" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sejour_lieuId_fkey" FOREIGN KEY ("lieuId") REFERENCES "Lieu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sejour_foyerId_fkey" FOREIGN KEY ("foyerId") REFERENCES "Foyer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Lieu_slug_key" ON "Lieu"("slug");
