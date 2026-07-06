---
description: Committer et pousser les modifications du workspace vers GitHub
---

# /commit

Objectif : sauvegarder proprement l'état actuel du workspace en un commit clair, puis le pousser sur GitHub pour que rien ne se perde entre les sessions.

## Ce que tu dois faire

Exécute ces étapes dans l'ordre. Ne pose pas de question intermédiaire tant que tu n'as pas atteint l'étape 4.

### 1. Lire l'état du dépôt

En parallèle, lance :

- `git status` (voir fichiers modifiés et non suivis, ne jamais utiliser `-uall`)
- `git diff` (voir les changements non stagés)
- `git diff --staged` (voir les changements déjà stagés)
- `git log --oneline -10` (pour caler le style des messages précédents)

Si `git status` ne renvoie aucun changement, dis simplement :

> Rien à committer, le workspace est propre.

Et arrête-toi là.

### 2. Analyser les changements

Regarde ce qui a bougé et classe-le mentalement :

- Mise à jour de contexte (CONTEXT.md, HISTORY.md, CLAUDE.md)
- Ajout d'un import dans `context/import/`
- Nouvelle commande dans `.claude/commands/`
- Nouvelle skill dans `.claude/skills/`
- Autre (module d'installation, README, etc.)

**Ne stage jamais aveuglément.** Vérifie qu'aucun fichier suspect n'est présent (`.env`, `*.key`, `*.pem`, fichiers de credentials, exports Notion contenant potentiellement des infos sensibles dans `context/import/secrets/`). Si tu détectes quelque chose de louche, arrête-toi et signale-le avant tout `git add`.

### 3. Rédiger le message de commit

Style à respecter, calé sur l'historique du dépôt :

- **Une seule ligne**, en français, sans point final
- Ton factuel, verbe à l'infinitif ou nom d'action ("Ajout de...", "Mise à jour de...", "Refonte de...", "Correction de...")
- Focalisé sur le "pourquoi" ou l'effet, pas sur le "quoi" détaillé
- Pas de tirets longs, pas d'emojis, pas de `Co-Authored-By`, pas de mention du modèle

Exemples valides tirés du dépôt :
- `Enrichissement de CONTEXT.md à partir du bilan de compétences`
- `Ajout de la commande /prime pour charger le contexte au démarrage`
- `Ajout d'un .gitignore pour protéger les secrets locaux`

Si plusieurs changements indépendants coexistent, propose à Vincent de les séparer en plusieurs commits avant de continuer.

### 4. Proposer et confirmer

Avant d'exécuter, présente à Vincent :

```
Fichiers à committer :
- <liste courte>

Message proposé :
"<message>"

OK pour committer et pousser ?
```

Attends sa confirmation. S'il propose une reformulation, applique-la telle quelle.

### 5. Exécuter

Une fois validé, en séquence :

1. `git add <fichiers explicites>` (jamais `git add -A` ni `git add .` sauf demande explicite)
2. `git commit -m "<message>"` (passage du message via HEREDOC si multi-lignes)
3. `git status` pour vérifier que le commit a réussi
4. `git push -u origin <branche courante>` (déterminer la branche via `git branch --show-current`)

Si le push échoue à cause d'un problème réseau, retente jusqu'à 4 fois avec un délai exponentiel (2s, 4s, 8s, 16s). Pour toute autre erreur, arrête-toi et remonte le message brut à Vincent.

### 6. Confirmer

Termine par une ligne courte du type :

> Commit `<sha court>` poussé sur `<branche>`. Workspace à jour.

## Règles

- Français, tutoiement, style direct
- Pas de tirets longs
- Jamais de `--force`, `--amend`, `--no-verify` sans demande explicite
- Jamais de modification de la config git
- Jamais de PR créée automatiquement (Vincent la demandera s'il en veut une)
- Si un hook pre-commit échoue : corrige le problème, refais un **nouveau** commit, ne l'amend pas
