# Kikimange · Prompt Claude Design

> Prompt prêt à coller dans Claude Design pour générer les maquettes (étape 4).
> Statut : v1.0 du 2026-09-23. Sources : `cadrage.md` v1.1, `architecture.md` v1.0, `palette.md` v1.0.
> Conseil : joindre au prompt une ou deux captures de Kikela (planning mobile et « Qui es-tu ? ») pour que Claude Design reprenne la même famille visuelle.

---

## Prompt à copier-coller

Conçois les maquettes haute fidélité de **Kikimange**, une application web (PWA) familiale qui répond à une question simple : **qui vient manger à la maison, à quel repas, avec qui ?**

Respecte le design system **Material 3** (https://m3.material.io/) : rôles de couleur, échelle typographique M3 (Roboto), formes arrondies, élévation, composants standards. L'application est la petite sœur de **Kikela** (planning des maisons de vacances familiales, déjà en production, palette terracotta). Même structure d'interface, mêmes composants, même ton chaleureux, mais **sa propre palette vert basilic**.

### Contexte et utilisateurs

Une famille de 5 personnes :
- **3 enfants adultes** (Léa, Tom, Jules, prénoms fictifs) qui vivent hors de la maison et viennent régulièrement déjeuner ou dîner, parfois accompagnés (conjoint, amis).
- **2 parents** qui préparent les repas et font les courses.

Objectifs :
- **Parents** : savoir à l'avance qui vient, à quel repas, combien de couverts et quelles envies, pour prévoir menus et courses.
- **Enfants** : voir qui sera là pour se retrouver entre frères et sœurs.

Critère de réussite : un enfant remplit sa semaine **en moins de 30 secondes** sur son téléphone.

### Règles métier à rendre visibles

- Deux créneaux par jour seulement : **déjeuner** (icône soleil) et **dîner** (icône lune). Une semaine = 7 jours × 2 = 14 créneaux, du lundi au dimanche.
- Une **participation** = un enfant à un repas, avec en option : accompagnants nommés (choisis dans sa liste), personnes en plus non nommées (+N), parts à emporter, idée de menu (liste déroulante de plats favoris), envies (texte libre), commentaire (texte libre, ex. « j'arrive vers 20 h »).
- **Total de couverts** par repas = enfants + accompagnants + invités + les 2 parents (sauf s'ils sont absents). Afficher par exemple « 7 couverts, dont vous 2 ».
- **Repas ouvert** : un parent lance une invitation (« Dimanche midi : raclette, qui vient ? »). Il doit se remarquer immédiatement.
- **Absence des parents** : indicative, **non bloquante**. Les enfants peuvent quand même s'inscrire (ils cuisineront eux-mêmes). À signaler clairement sans ressembler à une interdiction.
- **Période** : un enfant peut s'inscrire en une fois sur une période (ex. un stage d'un mois), déjeuner, dîner ou les deux. Les repas de la période apparaissent regroupés visuellement. On peut en retirer un seul sans casser la période.
- Les parents ne s'inscrivent pas aux repas : ils sont présents par défaut.

### Palette (imposée)

Couleur source Material 3 : **vert basilic `#4F7F3A`**, schéma Tonal Spot, thème clair uniquement.

| Rôle | Couleur | Usage |
|---|---|---|
| primary | `#436833` | Actions principales, FAB, créneau sélectionné |
| primary-container | `#C4EFAC` | Créneau où je viens, fond de l'écran d'accueil |
| secondary-container | `#D8E7CB` | Chips sélectionnées, regroupement d'une période |
| tertiary / tertiary-container | `#386667` / `#BBEBEC` | **Repas ouvert** |
| surface | `#F8FAF0` | Fond |
| surface-container | `#EDEFE5` | Cartes, bottom sheets |
| on-surface / on-surface-variant | `#191D17` / `#43483E` | Textes |
| outline-variant | `#C3C8BB` | Séparateurs |
| error | `#BA1A1A` | Suppression, erreur |

Repères fonctionnels, **discrets** (icône et libellé, pas de grands aplats) :
- Déjeuner : `#7D5700` sur `#FFDEA9`
- Dîner : `#4859A6` sur `#DDE1FF`
- Absence des parents : fond hachuré `#E0E4D9`, icône et texte `#5B6057`

Avatars des membres (initiales en blanc) : Léa `#B90C55`, Tom `#0060A8`, Jules `#B02E00`, parent 1 `#6F48B2`, parent 2 `#79564B`. Chaque membre garde sa couleur partout.

### Ton et univers

- Chaleureux, familial, un peu gourmand : l'esprit d'une cuisine où l'on se retrouve. Pas d'appli de réservation de restaurant, pas de look corporate.
- Tutoiement, phrases courtes, microcopy bienveillante (« Tu viens quand cette semaine ? », « Léa vient dimanche midi 🎉 »).
- Petites illustrations ou icônes culinaires possibles pour les états vides, sans surcharger.
- Coins généreux, espacements confortables, cibles tactiles d'au moins 48 px.

### Device

**Parité stricte mobile et desktop** : chaque écran clé en deux layouts. Le mobile est prioritaire pour les enfants.
- Mobile : navigation bar en bas (Semaine, Mois, Courses pour les parents), bottom sheets, FAB.
- Desktop : navigation rail, grille semaine complète visible d'un coup, panneau latéral pour le détail.

### Écrans à concevoir

**1. Qui es-tu ?**
Logo et nom Kikimange, accroche courte. Champ **code famille** (clavier numérique), puis grille des 5 membres (avatar + prénom). Message d'erreur si code faux.

**2. Installer l'appli et activer les notifications** (première visite)
Écran guidé, différent sur iPhone (« Partager, puis Sur l'écran d'accueil ») et Android. Bouton « Activer les notifications ». Option « Plus tard ».

**3. Semaine (écran principal, vue enfant)**
- En-tête : « Semaine du 28 septembre », flèches précédente / suivante.
- Mobile : liste des 7 jours, chaque jour avec ses 2 créneaux côte à côte. Desktop : grille 7 colonnes × 2 lignes.
- Chaque créneau : avatars des présents, total de couverts, badge « repas ouvert » le cas échéant, hachure si parents absents. Mes créneaux mis en évidence (primary-container).
- Mise en avant des retrouvailles : « Tom et toi dimanche midi ».
- Bouton bien visible « Je ne viens pas cette semaine ».
- Bouton principal « Valider ma semaine ». Action secondaire « Venir sur une période ».

**4. Semaine (vue parent)**
Même grille, plus : bandeau « Qui a répondu » (avatars avec coche ou point d'attente) et, pour chaque enfant sans réponse, bouton « Relancer » qui propose **WhatsApp** ou **SMS**. Accès rapide à « Créer un repas ouvert » et « Signaler une absence ».

**5. Feuille de participation** (bottom sheet sur mobile, panneau sur desktop)
En-tête : jour et créneau. Bascule « Ce repas / Une période ». Champs, tous facultatifs :
- Accompagnants : chips à cocher depuis ma liste, + « Ajouter quelqu'un »
- Personnes en plus : stepper +N
- Parts à emporter : stepper
- Idée de menu : liste déroulante des plats favoris
- Envies : texte libre
- Commentaire : texte libre
Si les parents sont absents ce jour-là, bandeau informatif (non bloquant) : « Papa et maman seront absents, tu pourras te servir ». Boutons « Enregistrer » et « Je ne viens plus » (si déjà inscrit).

**6. Variante période** de la feuille : date range picker M3, choix déjeuner / dîner / les deux, options communes, aperçu du nombre de repas générés (« 22 repas du 1er au 31 octobre »).

**7. Confirmation**
Écran chaleureux avec confettis, récapitulatif de la semaine (« 3 repas cette semaine »), retour à la semaine.

**8. Mois**
Calendrier mensuel, chaque jour avec deux pastilles (déjeuner, dîner) portant les avatars ou le nombre de présents. Périodes visibles en bandeau continu. Repas ouverts et absences repérables.

**9. Détail d'un repas**
Date et créneau, menu annoncé si repas ouvert, liste des présents (avatar, accompagnants, +N, parts à emporter, envies, commentaire), invités des parents, total de couverts. Parents : bouton « Ajouter un invité ».

**10. Récap courses de la semaine** (parent)
Par repas : total de couverts, parts à emporter, idées de menu, envies, remarques alimentaires (ex. « 1 végétarien »). Totaux de la semaine en haut. Lisible d'un coup d'œil au supermarché.

**11. Administration** (parent)
Onglets : Membres (téléphone, rappel du lundi activé / désactivé, notifications actives ou non sur leurs appareils), Plats favoris (liste réordonnable), Absences, Repas ouverts.

**12. Mes accompagnants** (enfant)
Liste avec nom et remarque permanente (« végétarien »), ajout, modification, archivage.

### Composants Material 3 attendus

Top app bar, navigation bar / navigation rail, cards, bottom sheets, filter chips et input chips (accompagnants), FAB étendu, steppers, menu déroulant (exposed dropdown), date range picker, segmented buttons (Ce repas / Une période ; Déjeuner / Dîner / Les deux), avatars et groupes d'avatars empilés, badges, snackbar, banners informatifs, switches (rappels).

### Livrable attendu

Pour chaque écran, une maquette haute fidélité **mobile ET desktop**, dans l'ordre du parcours : Qui es-tu ? → installation → semaine enfant → feuille de participation → variante période → confirmation → semaine parent → détail d'un repas → mois → récap courses → administration → mes accompagnants. Utilise des données réalistes : une semaine avec 2 enfants inscrits sur plusieurs repas, un repas ouvert le dimanche midi (raclette), une absence des parents le samedi soir, une période de stage en cours pour Jules.

---

## Notes de préparation

- Palette détaillée et tokens CSS : `palette.md`
- Prénoms des enfants fictifs dans le prompt. Les vrais prénoms seront saisis dans la base, pas dans les maquettes.
- Dans les maquettes, les parents apparaissent comme « Papa » et « Maman » dans la microcopy côté enfant. À ajuster si la famille utilise d'autres mots.
