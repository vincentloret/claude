# Livrables — Sites web

> Tout ce qui est site internet livré par Luna.

---

## Ce qui va ici

- Portfolio personnel (refonte du portfolio Figma actuel)
- Landing pages
- Sites vitrines
- Sites de projet
- Mini-sites de démonstration
- Prototypes HTML/CSS/JS servis en local ou déployés

## Ce qui ne va PAS ici

- Maquettes Figma → soit `livrables/` dans un sous-dossier dédié si c'est une refonte pure, soit dans le projet applicatif concerné
- Scripts d'automatisation d'un site → `livrables/applications/`
- Briefs vidéo pour promouvoir un site → `livrables/youtube/`

---

## Convention de nommage

Format standard `AAAA-MM-JJ_nom-du-projet/` (voir `livrables/README.md`).

**Exemples pour ce dossier :**
- `2026-07-15_portfolio-vincent/`
- `2026-09-01_landing-mission-freelance/`

---

## Structure recommandée par projet

```
AAAA-MM-JJ_nom-du-projet/
├── README.md          ← brief, statut, url de déploiement si applicable
├── src/               ← code source du site
├── assets/            ← images, polices, ressources
└── versions/          ← itérations conservées
```
