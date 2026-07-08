# Prompt Claude Design — Appli de réservation des lieux de vacances familiaux

> Prompt prêt à coller dans Claude (Claude Design) pour générer les maquettes.
> Statut : en cours — prompt rédigé, maquettes pas encore générées.

---

## Prompt à copier-coller

Conçois les maquettes haute-fidélité d'une application web de gestion des souhaits de réservation pour les lieux de vacances d'une famille. Respecte strictement le design system **Material 3** (https://m3.material.io/) : palette de couleurs dynamique générée à partir d'une couleur source, échelle typographique M3, formes, élévation, composants standards (chips, FAB, cards, navigation bar/rail, top app bar, etc.).

### Contexte

L'application s'appelle **[Nom de l'app]**. Elle permet aux membres d'une famille élargie (10 à 20 personnes sur 3-4 générations : grands-parents, parents, enfants, cousins) de consulter la disponibilité de 3 lieux de vacances familiaux et d'exprimer des souhaits de séjour, pour éviter que ces lieux restent inoccupés faute de visibilité.

**Les 3 lieux :**
1. **Appartement à Bolquère** (Pyrénées-Orientales, montagne)
2. **Maison à Gèdre** (Hautes-Pyrénées, montagne, proche cirque de Gavarnie)
3. **Maison à Saint-Gilles-Croix-de-Vie** (Vendée, bord de mer)

Chaque lieu doit avoir une **couleur d'accent et une icône dédiées**, utilisées de façon cohérente sur tous les écrans (chips de filtre, créneaux du calendrier, fiches lieu).

### Mécanisme de souhait

Un souhait n'est **pas** une réservation ferme individuelle : c'est une **intention posée par un foyer** (unité familiale, ex : "Famille Martin", "Paul & Léa"), avec un nombre de personnes concernées. Les souhaits sont **collectifs et visibles par toute la famille** dans le planning : chacun voit qui souhaite quoi, sur quelles dates, pour quel lieu. Un même créneau peut recevoir plusieurs souhaits de foyers différents (à eux de s'arranger ensuite).

Différencier visuellement dans le calendrier :
- **Réservation confirmée** (synchronisée depuis Google Calendar) : créneau plein/solide
- **Souhait exprimé** : créneau en pointillés ou opacité réduite, avec l'avatar du foyer

### Intégration Google Calendar

L'authentification, l'accès, la visualisation des calendriers et la création de réservations s'appuient sur l'API Google Calendar. L'écran d'authentification doit intégrer un bouton "Se connecter avec Google" conforme aux guidelines de branding Google (pas un bouton générique).

### Univers graphique

- **Ambiance : chaleureuse et familiale**, à l'intérieur du cadre Material 3. Couleur source suggérée : ton chaud (terracotta, ambre ou corail) pour générer la palette dynamique M3, plutôt qu'un bleu corporate froid.
- Typographie : échelle typographique M3 standard (Roboto ou équivalent), avec une hiérarchie claire entre titres de section, noms de lieux et métadonnées (dates, nombre de personnes).
- Formes arrondies, coins généreux sur les cards et boutons, pour renforcer le côté accueillant.
- Utiliser de vraies photos évocatrices pour illustrer les 3 lieux (montagne pour Bolquère et Gèdre, bord de mer pour Saint-Gilles-Croix-de-Vie) — même en placeholder, respecter cette distinction visuelle immédiate.
- **Différenciation des membres** : chaque membre/foyer a un avatar (photo ou initiales) avec une couleur associée, utilisée de façon cohérente partout où le membre apparaît (calendrier, formulaire, liste de souhaits).

### Device

Conçois les écrans à **parité stricte entre mobile et desktop** (pas de version "desktop adapté du mobile") : pour chaque écran clé, produis les deux layouts.
- **Mobile** : navigation bar en bas, filtres en chips scrollables horizontalement, FAB pour ajouter un souhait.
- **Desktop** : navigation rail ou drawer latéral, filtres et légende en sidebar persistante, calendrier plus large avec vue liste des prochains séjours en complément.

### Écrans à concevoir

**1. Authentification**
- Logo/nom de l'app en haut, accroche courte (ex : "Réservez vos vacances en famille")
- Photo ou carrousel chaleureux des 3 lieux en fond ou en illustration
- Bouton "Se connecter avec Google" (branding Google respecté)
- État de chargement pendant la synchronisation avec Google Calendar

**2. Planning (écran principal)**
- Vue calendrier partagée, mensuelle par défaut, avec bascule vers vue semaine et vue liste
- Filtres par lieu : chips avec couleur/icône dédiées à chaque lieu (Bolquère, Gèdre, Saint-Gilles-Croix-de-Vie), sélection multiple possible
- Légende visible : code couleur des 3 lieux + distinction réservation confirmée / souhait exprimé
- Créneaux occupés affichés pleins ; créneaux "souhait" en pointillés avec avatar du foyer concerné
- FAB (bouton d'action flottant) "Exprimer un souhait"
- Accès à la fiche détail d'un lieu depuis le nom du lieu ou son icône de filtre

**3. Formulaire d'ajout de souhait**
- Sélection du lieu : 3 choix visuels (photo + couleur + icône), sélection unique
- Sélection des dates : date range picker M3
- Sélection du foyer (pré-rempli avec le foyer de l'utilisateur connecté)
- Champ "nombre de personnes" : stepper numérique
- Champ note optionnelle (texte libre, ex : "on préfère la 2e quinzaine d'août")
- Bouton de validation "Exprimer le souhait"
- État de confirmation chaleureux après validation (ex : snackbar ou écran de succès avec message convivial)

**4. Fiche détail d'un lieu**
- Galerie photo (carrousel) du lieu
- Nom, localisation résumée (région)
- Capacité maximale (nombre de personnes)
- Liste des équipements avec icônes (wifi, parking, jardin, cheminée, lave-linge, etc.)
- Accès rapide : "Voir le planning de ce lieu" et "Exprimer un souhait pour ce lieu"

### Composants Material 3 nécessaires

- Top app bar (titre d'écran, avatar utilisateur)
- Navigation bar (mobile) / navigation rail ou drawer (desktop) : sections Planning, Lieux, Mon foyer
- Filter chips (filtres par lieu)
- FAB étendu ("Exprimer un souhait")
- Cards (carte lieu, carte souhait/réservation)
- Date range picker
- Avatars (photo ou initiales, couleur par membre/foyer)
- Boutons filled / outlined / text selon hiérarchie d'action
- Bottom sheet ou dialog (confirmation, détail rapide au clic sur un créneau)
- Snackbar (confirmation d'action)
- Badges (nombre de personnes sur un foyer)
- Segmented buttons ou tabs (bascule vue mois/semaine/liste)

### Livrable attendu

Pour chaque écran listé ci-dessus, produis une maquette haute-fidélité en version mobile ET desktop, avec les composants Material 3 correctement appliqués (couleurs de rôle, élévation, formes, typographie). Présente les écrans dans l'ordre du parcours utilisateur : authentification → planning → formulaire de souhait → fiche détail lieu.

---

## Notes de cadrage (décisions prises avant rédaction)

- Mécanisme souhait/réservation : souhait collectif visible par toute la famille
- Device prioritaire : mobile et desktop à parité
- Ambiance visuelle : chaleureuse et familiale, dans le cadre M3
- Différenciation : avatar/couleur par membre, couleur/icône par lieu, photos des lieux en fiche détail
- Nom de l'app : non tranché, placeholder à remplacer
- Composition famille : moyenne (10-20 membres, 3-4 générations avec cousins)
- Souhait posé par foyer (pas par individu), avec nombre de personnes
- Écrans complémentaires retenus : fiche détail d'un lieu uniquement (fiche détail souhait, profil membre et dashboard d'accueil écartés pour cette première itération)
