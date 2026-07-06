# Livrables

> Ici sont rangés tous les livrables produits par Luna pour Vincent.

---

## La règle d'or

**Inputs vs Outputs, ne jamais mélanger :**

| Type | Où ça va | Exemples |
|------|----------|----------|
| **Inputs** (documents que je fournis à Luna) | `context/import/` | PDFs, exports Notion, notes, captures d'écran, briefs reçus, bilans, articles à analyser |
| **Outputs** (ce que Luna produit pour moi) | `livrables/` | CV, portfolios, scripts, briefs vidéo, sites web, automatisations, textes rédigés |

Si Luna hésite sur où mettre un fichier, la question à se poser est simple : **qui a créé ce contenu ?**
- Créé par Vincent ou reçu de l'extérieur → `context/import/`
- Créé par Luna à la demande de Vincent → `livrables/`

---

## Organisation par sous-dossier

```
livrables/
├── sites-web/       ← sites internet (portfolio, sites de projet, landing pages...)
├── applications/    ← outils, scripts, automatisations, utilitaires
└── youtube/         ← briefs vidéo, scripts, storyboards, plans de tournage
```

Chaque sous-dossier a son propre `README.md` qui précise ce qu'il accueille.

Si un nouveau type de livrable apparaît (ex : présentations, ebooks, formations), créer un nouveau sous-dossier thématique plutôt que de tout entasser dans un dossier fourre-tout.

---

## Convention de nommage des projets

Chaque projet dans un sous-dossier utilise ce format :

```
AAAA-MM-JJ_nom-du-projet/
```

- **AAAA-MM-JJ** : date de démarrage du projet (pas date de fin)
- **nom-du-projet** : en minuscules, mots séparés par des tirets (kebab-case), pas d'accents, pas d'espaces

**Exemples :**
- `2026-07-06_portfolio-refonte/`
- `2026-07-10_cv-lead-ux/`
- `2026-08-01_script-veille-linkedin/`

**Pourquoi ce format :**
- Tri chronologique naturel dans le système de fichiers
- Lisible d'un coup d'œil
- Compatible avec tous les outils (pas de caractères spéciaux)

---

## Structure interne d'un projet

Au sein d'un dossier projet, Luna organise librement les fichiers selon la nature du livrable. Par défaut :

- Un `README.md` dans le dossier projet qui résume le brief, la date de livraison et le statut (en cours / livré / archivé)
- Les fichiers de travail à la racine du projet
- Un sous-dossier `versions/` si plusieurs itérations sont conservées
- Un sous-dossier `assets/` si des ressources graphiques accompagnent le livrable
