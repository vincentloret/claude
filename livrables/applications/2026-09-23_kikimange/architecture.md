# Kikimange · Modèle de données et architecture

> Statut : v1.0 du 2026-09-23, validé par Vincent.
> S'appuie sur `cadrage.md` v1.1 et sur le code de Kikela.

---

## 1. Principes

1. **Copier Kikela, pas le partager.** Nouveau projet Next.js démarré par copie de Kikela, puis nettoyage (suppression de Google Calendar, des lieux, des séjours). Pas de code commun ni de base commune : les deux applis évoluent indépendamment.
2. **Même stack** : Next.js 16 (App Router, Server Actions), Prisma 7 + Turso (libSQL), Tailwind 4 + tokens Material 3, déploiement Netlify, PWA.
3. **Dates sans fuseau.** Un repas est identifié par une date `AAAA-MM-JJ` (texte) et un créneau. Aucun `DateTime` pour les jours de repas, ce qui supprime tout risque de décalage d'un jour lié au fuseau horaire. Tous les calculs de semaine se font en heure de Paris. Les périodes ont une date de fin **incluse** (leçon du bug du jour de départ dans Kikela, dû à une fin exclusive).
4. **Rien n'est bloquant.** Aucune règle métier n'empêche une inscription (absence des parents, date passée, modification tardive). L'appli informe, elle n'interdit pas.

---

## 2. Modèle de données (Prisma)

### Vue d'ensemble

```
Membre ──< Accompagnant
   │
   ├──< Participation >── (date, créneau) ──── Repas (facultatif) ──< InviteRepas
   │        │   └──>< Accompagnant (n-n)
   │        └── Periode (facultatif)
   │
   ├──< ReponseSemaine
   └──< AbonnementPush

AbsenceParents        PlatFavori
```

Le **repas n'existe pas forcément en base**. Un créneau (date + déjeuner/dîner) est une coordonnée. La table `Repas` ne stocke que ce que les parents ajoutent sur un créneau : repas ouvert, menu annoncé, invités. Les participations pointent sur la coordonnée, pas sur une ligne `Repas`. Ça évite de créer 14 lignes vides par semaine.

### Schéma

```prisma
enum Role {
  enfant
  parent
}

enum Creneau {
  dejeuner
  diner
}

model Membre {
  id             String   @id @default(cuid())
  nom            String
  initiales      String
  couleur        String
  role           Role
  telephone      String?          // pour la relance WhatsApp / SMS
  rappelActif    Boolean  @default(true)
  ordre          Int      @default(0)
  accompagnants  Accompagnant[]
  participations Participation[]
  periodes       Periode[]
  reponses       ReponseSemaine[]
  abonnements    AbonnementPush[]
}

model Accompagnant {
  id             String   @id @default(cuid())
  nom            String
  remarque       String?          // permanente, ex. "végétarien"
  archive        Boolean  @default(false) // masqué des choix, conservé dans l'historique
  membre         Membre   @relation(fields: [membreId], references: [id], onDelete: Cascade)
  membreId       String
  participations Participation[]
}

model Participation {
  id              String         @id @default(cuid())
  membre          Membre         @relation(fields: [membreId], references: [id], onDelete: Cascade)
  membreId        String
  date            String         // "AAAA-MM-JJ"
  creneau         Creneau
  accompagnants   Accompagnant[]
  supplementaires Int            @default(0) // +N non nommés
  partsAEmporter  Int            @default(0)
  platFavori      PlatFavori?    @relation(fields: [platFavoriId], references: [id], onDelete: SetNull)
  platFavoriId    String?
  envies          String?
  commentaire     String?
  periode         Periode?       @relation(fields: [periodeId], references: [id], onDelete: SetNull)
  periodeId       String?
  creeLe          DateTime       @default(now())
  modifieLe       DateTime       @updatedAt

  @@unique([membreId, date, creneau]) // un enfant ne s'inscrit qu'une fois par repas
  @@index([date])
}

model Periode {
  id             String          @id @default(cuid())
  membre         Membre          @relation(fields: [membreId], references: [id], onDelete: Cascade)
  membreId       String
  debut          String          // "AAAA-MM-JJ"
  fin            String
  dejeuner       Boolean
  diner          Boolean
  participations Participation[]
  creeLe         DateTime        @default(now())
}

model Repas {
  date         String
  creneau      Creneau
  ouvert       Boolean       @default(false) // "dimanche midi, raclette, qui vient ?"
  menuAnnonce  String?
  invites      InviteRepas[]

  @@id([date, creneau])
}

model InviteRepas {
  id           String  @id @default(cuid())
  repas        Repas   @relation(fields: [repasDate, repasCreneau], references: [date, creneau], onDelete: Cascade)
  repasDate    String
  repasCreneau Creneau
  nom          String          // "Papi et Mamie"
  nombre       Int     @default(1)
  remarque     String?
}

model AbsenceParents {
  id           String   @id @default(cuid())
  debutDate    String
  debutCreneau Creneau
  finDate      String
  finCreneau   Creneau
  note         String?          // "week-end à Paris"
  creeLe       DateTime @default(now())
}

model PlatFavori {
  id             String          @id @default(cuid())
  nom            String
  ordre          Int             @default(0)
  actif          Boolean         @default(true)
  participations Participation[]
}

// Trace "a répondu pour la semaine", y compris "je ne viens pas".
model ReponseSemaine {
  membre    Membre   @relation(fields: [membreId], references: [id], onDelete: Cascade)
  membreId  String
  lundi     String            // "AAAA-MM-JJ" du lundi de la semaine
  neVientPas Boolean @default(false)
  reponduLe DateTime @default(now())

  @@id([membreId, lundi])
}

model AbonnementPush {
  id        String   @id @default(cuid())
  membre    Membre   @relation(fields: [membreId], references: [id], onDelete: Cascade)
  membreId  String
  endpoint  String   @unique
  p256dh    String
  auth      String
  appareil  String?           // user-agent simplifié, pour l'admin
  creeLe    DateTime @default(now())
}
```

### Règles de calcul (côté code, pas en base)

- **Couverts d'une participation** = 1 + nombre d'accompagnants + supplémentaires.
- **Total d'un repas** = somme des couverts des participations + somme des `nombre` des invités + 2 parents, sauf pendant une absence des parents. Affichage « 7 couverts dont vous 2 ».
- **Parents absents sur un créneau** : le créneau est compris entre `(debutDate, debutCreneau)` et `(finDate, finCreneau)`. Ordre : déjeuner avant dîner.
- **A répondu cette semaine** : existence d'une `ReponseSemaine` pour le lundi courant. Une participation ajoutée hors du parcours « semaine » (depuis le mois, par exemple) crée aussi la réponse.
- **Période** : à la création, génère une `Participation` par créneau coché entre `debut` et `fin`, avec les mêmes options. Si une participation existe déjà sur un créneau, elle est conservée telle quelle (pas d'écrasement). Retirer un repas = supprimer sa participation. « Modifier toute la période » = mise à jour de toutes les participations qui portent le `periodeId`. Supprimer la période supprime ses participations futures, les passées restent.

---

## 3. Architecture applicative

### Arborescence cible

```
kikimange/
├── prisma/                     schema, migrations, seed (membres, plats favoris)
├── public/sw.js                service worker (réception des push, clic → ouvre la bonne semaine)
├── netlify/functions/
│   └── rappel-lundi.mts        fonction planifiée (voir §4)
└── src/
    ├── app/
    │   ├── qui-es-tu/                     identification
    │   ├── (app)/semaine/[[...lundi]]/    écran principal, semaine courante par défaut
    │   ├── (app)/mois/[[...mois]]/        vue mois
    │   ├── (app)/repas/[date]/[creneau]/  détail d'un repas
    │   ├── (app)/courses/[[...lundi]]/    récap courses (parent)
    │   ├── (app)/accompagnants/           mes accompagnants (enfant)
    │   ├── (app)/admin/                   membres, rappels, plats, invités (parent)
    │   └── api/push/abonnement/route.ts   enregistre / supprime un abonnement push
    ├── components/             repris de Kikela : AppShell, Avatar, Confetti, DatePicker, Icon…
    └── lib/
        ├── prisma.ts           identique à Kikela
        ├── session.ts          cookie membre + rôle
        ├── jours.ts            dates "AAAA-MM-JJ", semaines, heure de Paris
        ├── queries.ts          lectures (semaine, mois, repas, récap)
        ├── actions.ts          Server Actions (écritures)
        ├── couverts.ts         règles de calcul du §2
        ├── push.ts             envoi Web Push (lib `web-push`)
        └── relance.ts          construction des liens wa.me / sms:
```

### Ce qu'on reprend de Kikela

| Élément | Reprise |
|---|---|
| Prisma + adaptateur libSQL web, `prisma.config.ts` | Tel quel |
| « Qui es-tu ? » + cookie 1 an | Adapté : `Membre` au lieu de `Foyer`, rôle lu depuis la base |
| AppShell, navigation mobile / desktop | Adapté (onglets Semaine, Mois, Courses) |
| Avatar, Confetti, DatePicker (range), Icon | Tel quel |
| WeekCalendar / MonthCalendar | Base de départ, grille repensée (2 créneaux par jour) |
| Manifest PWA, icônes générées | Adapté (nom, couleurs) |
| Google Calendar (auth, sync) | **Supprimé** |

### Écriture de la semaine

Dans le parcours P1, l'enfant touche plusieurs créneaux puis valide. Les choix restent **en état local côté client** jusqu'à « Valider ». Une seule Server Action `enregistrerSemaine(lundi, participations[])` applique le différentiel (créations, modifications, suppressions) dans une transaction, pose la `ReponseSemaine` et envoie **une seule** notification aux parents. Sans ça, les parents recevraient une notification par créneau touché.

Les modifications isolées (depuis le mois ou le détail d'un repas) passent par des actions unitaires et notifient à chaque fois. Si ça devient bruyant, on regroupera plus tard.

---

## 4. Notifications push

### Mécanique

- **Web Push standard** (VAPID) via la librairie `web-push`. Gratuit, sans service tiers.
- Chaque appareil qui accepte les notifications crée un `AbonnementPush` rattaché au membre identifié. Un membre peut en avoir plusieurs (téléphone + ordinateur).
- Abonnement expiré (réponse 404/410 à l'envoi) : supprimé automatiquement.
- Variables d'environnement : `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

### Rappel du lundi 11 h

- **Netlify Scheduled Function** (inclus dans l'offre gratuite).
- Le cron Netlify est en UTC, et 11 h à Paris vaut 9 h UTC en été, 10 h UTC en hiver. La fonction tourne donc à `0 9,10 * * 1` et n'envoie que si l'heure de Paris est 11 h. Même principe si on change l'heure plus tard.
- Destinataires : enfants avec `rappelActif = true` **qui n'ont pas encore de `ReponseSemaine`** pour la semaine en cours (par exemple parce qu'ils ont déjà rempli via une période).

### Contrainte iPhone (importante)

Sur iPhone, les notifications web ne fonctionnent que si l'appli est **ajoutée à l'écran d'accueil** (iOS 16.4 minimum), puis ouverte depuis cette icône pour accepter les notifications. Sur Android, ça marche depuis le navigateur. Conséquences :
- un écran d'accueil guidé « Installer Kikimange » la première fois, selon l'appareil ;
- la relance WhatsApp / SMS reste le filet de sécurité pour qui n'a pas activé les notifications ;
- l'admin affiche, par membre, si les notifications sont actives (au moins un abonnement).

### Relance WhatsApp / SMS

Aucun envoi serveur. Le bouton « Relancer » construit un lien :
- WhatsApp : `https://wa.me/33XXXXXXXXX?text=<message encodé>`
- SMS : `sms:+33XXXXXXXXX?body=<message encodé>` (syntaxe compatible iOS et Android)

Le parent choisit le canal, son téléphone ouvre l'appli avec le message prérempli, il n'a plus qu'à envoyer.

---

## 5. Sécurité et accès

- **Code famille** demandé une fois par appareil sur « Qui es-tu ? », comparé à la variable `FAMILLE_CODE`. Si la variable n'est pas définie, l'accès est refusé. Même mécanique que Kikela (`verifierCodeFamille`). Raison : l'appli affiche quand la maison est vide et les numéros des enfants.
- Cookie `kikimange_membre` (httpOnly, 1 an), comme Kikela.
- Le layout `(app)` redirige vers « Qui es-tu ? » si aucun membre n'est identifié : aucune page n'est lisible sans code.
- Chaque Server Action vérifie qu'un membre est identifié. Les actions parent vérifient le rôle en base. Le choix du rôle reste libre (pas de code parent), conformément au cadrage.

---

## 6. Déploiement

- Nouvelle base Turso `kikimange`, nouveau site Netlify, dépôt dans le même monorepo que Luna.
- Variables : `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `VAPID_*`, `FAMILLE_CODE`.
- Seed initial : les 5 membres (3 enfants, 2 parents) et une première liste de plats favoris, à fournir par Vincent.

---

## 7. Décisions (2026-09-23)

1. **Code famille** : oui, saisi une fois par appareil. À faire aussi dans Kikela.
2. **Parents dans le total de couverts** : oui, 2 par défaut, retirés pendant une absence. C'est le chiffre utile pour les courses.
3. **Rappel du lundi** : pas envoyé à un enfant qui a déjà répondu pour la semaine.
4. **Accompagnant ajouté à la volée** : enregistré automatiquement dans la liste de l'enfant.
5. **Parents participants** : non. Ils sont présents par défaut et gèrent absences, repas ouverts et invités. Le rôle parent ne donne donc pas accès à la feuille de participation.
