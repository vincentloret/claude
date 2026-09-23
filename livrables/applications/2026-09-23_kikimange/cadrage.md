# Kikimange · Cadrage fonctionnel

> Statut : v1.1 du 2026-09-23, validé par Vincent (décisions complétées à l'étape 2).
> Projet frère : Kikela (`../2026-07-08_appli-reservation-vacances-familiales/`).

---

## 1. Vision

**Savoir à l'avance qui vient manger à la maison, pour mieux accueillir les enfants et favoriser les moments en famille.**

Deux bénéfices :
- **Parents** : prévoir les menus et les courses (qui vient, à quel repas, combien de personnes, quelles envies).
- **Enfants** : voir qui sera présent pour se retrouver entre frères et sœurs.

Critère de succès : chaque enfant « actif » remplit son Kikimange chaque semaine, en moins de 30 secondes.

---

## 2. Utilisateurs et rôles

| Rôle | Qui | Ce qu'il peut faire |
|---|---|---|
| **Enfant** | Les 3 enfants (vivant hors de la maison) | Déclarer, modifier ou supprimer ses participations. Gérer ses accompagnants. Consulter le calendrier de tout le monde. |
| **Parent** | Vincent et sa femme | Consulter le calendrier. Créer des repas ouverts, signaler leurs absences, gérer les membres, les invités, les plats favoris et les notifications. |

Identification : même logique que Kikela (code famille saisi une fois, écran « Qui es-tu ? », puis cookie sur l'appareil). Pas de protection supplémentaire du rôle parent : confiance familiale.

---

## 3. Objets métier

- **Membre** : enfant ou parent. Nom, initiales, couleur d'avatar, téléphone, rappel hebdo activé/désactivé.
- **Accompagnant** : personne nommée et réutilisable, rattachée à un enfant (conjoint, ami habituel). Nom, remarque permanente éventuelle (ex. végétarien).
- **Repas** : une date + un créneau (**déjeuner** ou **dîner**). Uniquement ces deux créneaux.
- **Participation** : un enfant à un repas, avec :
  - accompagnants nommés (choisis dans sa liste, ou ajoutés à la volée)
  - personnes supplémentaires non nommées (+N)
  - nombre de **parts à emporter** pour plus tard
  - **idée de menu** : choix dans la liste des plats favoris (menu déroulant)
  - **envies de** : texte libre
  - **commentaire** : texte libre (heure d'arrivée ou de départ, invité végétarien…)
- **Repas ouvert** (créé par un parent) : invitation sur un créneau (« dimanche midi, raclette, qui vient ? »), avec le menu annoncé.
- **Participation sur une période** : un enfant s'inscrit en une fois à tous les repas d'une période (ex. stage d'un mois). Il choisit la date de début, la date de fin et les créneaux (déjeuner, dîner ou les deux). Les options (accompagnants, envies, commentaire…) s'appliquent à toute la période. Cela génère des participations individuelles, que l'on peut ensuite modifier ou supprimer une à une (ex. « pas là le mercredi soir »), ou toutes à la fois.
- **Absence des parents** (créée par un parent) : information indicative (« absents ce week-end »). Les enfants **peuvent quand même s'inscrire** : les parents prévoient les courses, mais les enfants se préparent à manger. L'absence est bien visible au moment de l'inscription.
- **Invité des parents** : personne extérieure ajoutée par un parent à un repas (grands-parents, amis). Elle compte dans le total mais n'est pas utilisatrice de l'application.
- **Plat favori** : liste gérée par les parents, qui alimente le menu déroulant « Idée de menu ».

---

## 4. Parcours clés

### P1 · Le rappel du lundi (enfant)
1. Le lundi à 11 h, chaque enfant dont le rappel est activé reçoit une notification : « Ton Kikimange de la semaine ».
2. Il ouvre directement la vue semaine en cours (lundi à dimanche, 14 créneaux).
3. Il touche les créneaux où il vient. Pour chacun, une feuille de détail s'ouvre : accompagnants, parts à emporter, idée de menu, envies, commentaire. Tout est facultatif.
4. Un bouton « Je ne viens pas cette semaine » permet de répondre en un tap.
5. Il valide. Écran de confirmation chaleureux (confettis, comme dans Kikela).
6. Les deux parents reçoivent une notification récapitulative.

### P2 · Consulter la semaine (parent)
- La vue semaine est la vue par défaut. Pour chaque repas : qui vient, le total de couverts, les parts à emporter, les idées et les envies.
- Un récapitulatif « courses » de la semaine : total de couverts par repas, envies, remarques alimentaires.
- On voit qui a répondu ou non cette semaine, avec un bouton de relance par SMS ou WhatsApp.

### P3 · Se voir entre frères et sœurs (enfant)
- Dans la vue semaine, chaque repas affiche les avatars des présents.
- Mise en avant : « Léa vient dimanche midi ».

### P4 · Anticiper (tous)
- Navigation vers les semaines suivantes et vue mois, pour ajouter, modifier ou supprimer une participation à l'avance.

### P5 · Venir sur une période (enfant)
1. Depuis la semaine ou le mois, action « Venir sur une période ».
2. Il choisit les dates (date range picker, comme dans Kikela) et les créneaux (déjeuner, dîner, les deux).
3. Il renseigne les options communes, puis valide. Les repas de la période s'affichent dans le calendrier, regroupés visuellement.
4. Il peut retirer un repas ponctuel sans casser la période.
5. Les rappels du lundi restent envoyés pendant la période : ils servent à ajuster la semaine.

### P6 · Gérer (parent)
- Créer un repas ouvert ou signaler une absence des parents.
- Ajouter un invité à un repas.
- Gérer les membres, les rappels (activer ou désactiver par enfant, par exemple pendant un voyage) et les plats favoris.

---

## 5. Notifications

| Événement | Destinataires | Canal |
|---|---|---|
| Rappel hebdomadaire (lundi 11 h) | Enfants dont le rappel est activé | Push PWA |
| Un enfant a validé ou modifié sa semaine | Les 2 parents | Push PWA |
| Un parent crée un repas ouvert | Enfants (rappel activé) | Push PWA |
| Relance manuelle d'un enfant qui n'a pas répondu | Enfant concerné | SMS ou WhatsApp, en semi-automatique : le bouton « Relancer » ouvre WhatsApp ou l'appli SMS du parent avec un message prérempli et le lien. Gratuit, sans service externe. |

---

## 6. Écrans (base pour Claude Design)

1. **Qui es-tu ?** (code famille, puis choix du membre)
2. **Semaine** (écran principal) : 7 jours × déjeuner/dîner, avatars, total de couverts, repas ouverts, absences des parents, périodes.
3. **Feuille de participation** : accompagnants, +N, parts à emporter, idée de menu, envies, commentaire. Bascule « un repas / une période ».
4. **Confirmation**
5. **Mois** : vue d'ensemble, pastilles par repas.
6. **Détail d'un repas** : liste des présents, menu, remarques, total.
7. **Récap courses de la semaine** (parent)
8. **Administration** (parent) : membres et rappels, accompagnants, plats favoris, invités.
9. **Mes accompagnants** (enfant)

Parité mobile et desktop, comme Kikela. Le mobile est prioritaire pour les enfants.

---

## 7. Hors périmètre du MVP

- Petit-déjeuner, goûter, brunch
- Liste de courses détaillée par ingrédient
- Synchronisation avec Google Calendar (à reconsidérer plus tard)
- Historique et statistiques

---

## 8. Décisions

### Arrêtées (2026-09-23)
1. **Rappel hebdomadaire** : le lundi à 11 h, pour la semaine en cours. Le déjeuner du lundi est donc rarement anticipé, c'est accepté.
2. **Modification** : sans date limite. Une participation peut être modifiée ou supprimée à tout moment. Les parents sont notifiés.
3. **Relance** : semi-automatique par WhatsApp ou SMS (voir §5). Pas de service SMS payant ni d'API WhatsApp Business.
4. **Accès** : un code famille, saisi une fois par appareil (l'appli montre quand la maison est vide). Pas de code spécifique au rôle parent : le choix se fait dans « Qui es-tu ? », sur la base de la confiance familiale.
5. **Créneaux « bloqués »** : ce sont des absences des parents, à titre indicatif et non bloquantes.
6. **Périodes** : un enfant peut s'inscrire à tous les repas d'une période.
7. **Couverts** : le total inclut les 2 parents, sauf pendant leurs absences.
8. **Rappel** : pas envoyé à un enfant qui a déjà répondu pour la semaine.
9. **Accompagnants** : un accompagnant ajouté à la volée est enregistré dans la liste de l'enfant.
10. **Parents** : ils ne s'inscrivent pas aux repas, ils sont présents par défaut.

### Restant à trancher
- **Palette** : couleur source à choisir, distincte du terracotta de Kikela (pistes : vert basilic, aubergine, jaune moutarde). À trancher à l'étape 3.
