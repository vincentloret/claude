-- CreateTable
CREATE TABLE "Membre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "initiales" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "telephone" TEXT,
    "rappelActif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Accompagnant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "remarque" TEXT,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "membreId" TEXT NOT NULL,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Accompagnant_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "Membre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membreId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "creneau" TEXT NOT NULL,
    "supplementaires" INTEGER NOT NULL DEFAULT 0,
    "partsAEmporter" INTEGER NOT NULL DEFAULT 0,
    "platFavoriId" TEXT,
    "envies" TEXT,
    "commentaire" TEXT,
    "periodeId" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" DATETIME NOT NULL,
    CONSTRAINT "Participation_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "Membre" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Participation_platFavoriId_fkey" FOREIGN KEY ("platFavoriId") REFERENCES "PlatFavori" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Participation_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Periode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membreId" TEXT NOT NULL,
    "nom" TEXT,
    "debut" TEXT NOT NULL,
    "fin" TEXT NOT NULL,
    "dejeuner" BOOLEAN NOT NULL,
    "diner" BOOLEAN NOT NULL,
    "jours" TEXT NOT NULL DEFAULT '1234567',
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Periode_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "Membre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Repas" (
    "date" TEXT NOT NULL,
    "creneau" TEXT NOT NULL,
    "ouvert" BOOLEAN NOT NULL DEFAULT false,
    "menuAnnonce" TEXT,
    "heure" TEXT,

    PRIMARY KEY ("date", "creneau")
);

-- CreateTable
CREATE TABLE "InviteRepas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repasDate" TEXT NOT NULL,
    "repasCreneau" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "nombre" INTEGER NOT NULL DEFAULT 1,
    "remarque" TEXT,
    CONSTRAINT "InviteRepas_repasDate_repasCreneau_fkey" FOREIGN KEY ("repasDate", "repasCreneau") REFERENCES "Repas" ("date", "creneau") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AbsenceParents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "debutDate" TEXT NOT NULL,
    "debutCreneau" TEXT NOT NULL,
    "finDate" TEXT NOT NULL,
    "finCreneau" TEXT NOT NULL,
    "note" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlatFavori" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "ReponseSemaine" (
    "membreId" TEXT NOT NULL,
    "lundi" TEXT NOT NULL,
    "neVientPas" BOOLEAN NOT NULL DEFAULT false,
    "reponduLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("membreId", "lundi"),
    CONSTRAINT "ReponseSemaine_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "Membre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AbonnementPush" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membreId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "appareil" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AbonnementPush_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "Membre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AccompagnantToParticipation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AccompagnantToParticipation_A_fkey" FOREIGN KEY ("A") REFERENCES "Accompagnant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AccompagnantToParticipation_B_fkey" FOREIGN KEY ("B") REFERENCES "Participation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Participation_date_idx" ON "Participation"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_membreId_date_creneau_key" ON "Participation"("membreId", "date", "creneau");

-- CreateIndex
CREATE UNIQUE INDEX "AbonnementPush_endpoint_key" ON "AbonnementPush"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "_AccompagnantToParticipation_AB_unique" ON "_AccompagnantToParticipation"("A", "B");

-- CreateIndex
CREATE INDEX "_AccompagnantToParticipation_B_index" ON "_AccompagnantToParticipation"("B");
