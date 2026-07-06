# Livrables — Applications

> Outils, scripts, automatisations et utilitaires produits par Luna.

---

## Ce qui va ici

- Scripts Python, Node, Bash
- Automatisations (veille, rappels, synchros, exports)
- Petits outils en ligne de commande
- Prototypes fonctionnels (démos IA, générateurs, moulinettes)
- Intégrations avec des services (Notion, Figma, LinkedIn, GitHub, calendrier)
- Templates de workflow (n8n, Zapier, Make) exportés en JSON

## Ce qui ne va PAS ici

- Sites web servis à un utilisateur final → `livrables/sites-web/`
- Scripts de contenu YouTube (voix off, montage) → `livrables/youtube/`
- Configuration de Luna elle-même (skills, commandes) → `.claude/` à la racine

---

## Convention de nommage

Format standard `AAAA-MM-JJ_nom-du-projet/` (voir `livrables/README.md`).

**Exemples pour ce dossier :**
- `2026-07-20_veille-linkedin-nantes/`
- `2026-08-05_export-notion-vers-md/`
- `2026-09-10_generateur-cv-pdf/`

---

## Structure recommandée par projet

```
AAAA-MM-JJ_nom-du-projet/
├── README.md          ← brief, statut, comment lancer l'outil
├── src/               ← code source
├── requirements.txt   ← ou package.json, selon la stack
├── examples/          ← exemples d'entrées et de sorties
└── data/              ← données de test (si non sensibles)
```
