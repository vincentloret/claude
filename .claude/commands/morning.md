---
description: Démarrer la journée avec une veille personnalisée en 30 secondes
---

# /morning

Cette commande lance une veille rapide et contextualisée pour bien démarrer la journée.

## Ce que tu fais

1. **Charge mon contexte** en lisant :
   - `CLAUDE.md`
   - `context/CONTEXT.md` (surtout mes objectifs, projets, secteur d'activité)

2. **Active la skill `recherche-actualites-contextualisees`** (`.claude/skills/recherche-actualites-contextualisees/SKILL.md`) et suis ses instructions pour filtrer les actualités selon mon profil.

3. **Livre un briefing court, lisible en 30 secondes**, structuré ainsi :

   ```
   ## Briefing du [date]

   **3 actus qui te concernent aujourd'hui**
   1. [Titre court] — [1 phrase de pourquoi ça te concerne]
   2. ...
   3. ...

   **Focus proposé pour ta journée**
   [1 à 2 phrases avec une piste d'action concrète en lien avec un projet en cours]
   ```

4. **Termine par une question** : est-ce qu'on creuse une actu ou est-ce qu'on attaque le focus proposé ?

## Règles

- Priorité absolue : pertinence sur mon contexte (UX / IA / marché de l'emploi Nantes / repositionnement pro)
- Zéro bruit, zéro actu générique
- 3 actus maximum, pas plus
- Français, direct, pas de tirets longs
- Si l'accès web n'est pas dispo dans la session, dis-le clairement au lieu d'inventer
