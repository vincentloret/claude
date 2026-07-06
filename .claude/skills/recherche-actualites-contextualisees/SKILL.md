---
name: recherche-actualites-contextualisees
description: Effectue une veille d'actualités filtrée selon le contexte personnel et professionnel de l'utilisateur. À déclencher quand l'utilisateur demande une veille, un point actu, les news du jour, un briefing matinal, ou via la commande /morning.
---

# Recherche d'actualités contextualisées

## Mission

Livrer un briefing court et pertinent d'actualités du jour, filtré strictement selon le contexte personnel de Vincent (défini dans `CLAUDE.md` et `context/CONTEXT.md`). Zéro actu générique, uniquement ce qui a un impact réel sur ses objectifs ou ses projets.

## Quand tu es déclenchée

- Commande `/morning`
- Formulations libres du type : "fais-moi un point sur les actualités", "donne-moi les news du jour", "veille du jour", "quoi de neuf aujourd'hui", "brief matinal"

## Étape 1 — Charger le contexte

Avant toute recherche, lis :
- `CLAUDE.md` (section "Who I Am" et objectifs)
- `context/CONTEXT.md` (sections "Qui je suis", "Ce que je fais", "Mes objectifs court terme", "Mes projets en cours")

Identifie les axes de filtrage prioritaires (aujourd'hui pour Vincent) :
- **UX design et Product design** : tendances, méthodes, outils, débats sur le métier
- **IA appliquée au design** : intégration IA dans les workflows UX, outils émergents
- **Marché de l'emploi UX** : offres Lead UX / UX Strategist / Senior Product Designer, en priorité bassin nantais
- **Écosystème employeurs cibles** : annonceurs, scale-ups tech, structures alignées avec ses valeurs (pas ESN, pas agences de com)
- **Actualités locales Nantes** : événements pro, meetups, conférences UX/design/tech
- **Bilan de compétences et repositionnement pro** : éclairages utiles à sa démarche

## Étape 2 — Rechercher

Utilise `WebSearch` (et `WebFetch` pour approfondir un article si besoin) avec des requêtes ciblées sur les axes ci-dessus.

Bonnes pratiques :
- Requêtes précises et récentes (ajoute l'année en cours ou "aujourd'hui" si pertinent)
- Croise 2 à 3 requêtes différentes pour élargir la couverture
- Si l'outil web n'est pas disponible dans la session, dis-le clairement et propose plutôt un focus produit sur ses projets en cours

## Étape 3 — Filtrer sévèrement

Règle d'or : **si tu hésites à inclure une actu, exclus-la**.

Critères d'inclusion :
- L'actu a un lien direct avec un de ses objectifs ou projets actifs
- L'actu peut générer une action concrète de sa part (postuler, contacter, apprendre, décider)
- L'actu concerne son écosystème direct (employeurs cibles, réseau nantais, communauté UX/design)

Critères d'exclusion automatique :
- Actus politiques, économiques ou géopolitiques générales
- Buzz tech sans lien avec son métier
- Contenus promotionnels déguisés en actualité
- Info déjà connue ou triviale

## Étape 4 — Livrer le briefing

Format strict, lisible en 30 secondes :

```
## Briefing du [date du jour]

**3 actus qui te concernent aujourd'hui**
1. **[Titre court et informatif]** — [1 phrase qui explique pourquoi c'est pertinent pour lui, quel projet ou objectif c'est en lien avec]
   Source : [nom du média]
2. ...
3. ...

**Focus proposé pour ta journée**
[1 à 2 phrases avec une piste d'action concrète en lien avec un projet en cours, ancrée dans une des actus quand c'est pertinent]
```

Termine par une question ouverte : est-ce qu'on creuse une actu ou est-ce qu'on attaque le focus proposé ?

## Règles de communication

- Français, tutoiement, direct
- Pas de tirets longs (em dashes)
- 3 actus maximum, jamais plus
- Toujours citer la source
- Jamais inventer une actu, mieux vaut en livrer 2 pertinentes que 3 avec du remplissage
- Reste factuel, pas d'analyse politique ou d'opinion personnelle non demandée
