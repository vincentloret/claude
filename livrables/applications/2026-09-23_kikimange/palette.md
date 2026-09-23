# Kikimange · Palette

> Statut : v1.0 du 2026-09-23. Couleur source : **vert basilic `#4F7F3A`**.
> Générée avec `@material/material-color-utilities` (schéma Material 3 *Tonal Spot*), la même logique que la palette terracotta de Kikela.

---

## 1. Rôles Material 3 (thème clair)

| Rôle | Couleur | Usage dans Kikimange |
|---|---|---|
| primary | `#436833` | Boutons principaux, FAB, créneau sélectionné, onglet actif |
| on-primary | `#FFFFFF` | Texte sur primary |
| primary-container | `#C4EFAC` | Fond de l'écran « Qui es-tu ? », créneau où je viens |
| on-primary-container | `#2C4F1D` | Texte sur primary-container |
| secondary | `#55624C` | Actions secondaires, chips |
| secondary-container | `#D8E7CB` | Chips sélectionnées, période (regroupement des repas) |
| on-secondary-container | `#3D4B36` | Texte sur secondary-container |
| tertiary | `#386667` | **Repas ouvert** (invitation des parents) |
| tertiary-container | `#BBEBEC` | Fond d'une carte de repas ouvert |
| on-tertiary-container | `#1E4E4F` | Texte sur tertiary-container |
| error | `#BA1A1A` | Suppression, erreurs (code famille faux) |
| error-container | `#FFDAD6` | Fond des messages d'erreur |
| surface | `#F8FAF0` | Fond de l'appli |
| surface-container-low | `#F2F5EA` | Cellules de la grille semaine |
| surface-container | `#EDEFE5` | Cartes, feuilles |
| surface-container-high | `#E7E9DF` | Barre de navigation |
| surface-container-highest | `#E1E4D9` | Champs de saisie |
| on-surface | `#191D17` | Texte principal |
| on-surface-variant | `#43483E` | Texte secondaire, métadonnées |
| outline | `#73796E` | Bordures, contours |
| outline-variant | `#C3C8BB` | Séparateurs |
| inverse-surface | `#2E312B` | Snackbar |

Thème sombre généré aussi (voir §4), à garder pour plus tard. Kikela n'a pas de thème sombre, on reste cohérent pour le MVP.

---

## 2. Couleurs fonctionnelles

| Élément | Accent | Container | On-container | Repère visuel |
|---|---|---|---|---|
| Déjeuner | `#7D5700` | `#FFDEA9` | `#271900` | Icône soleil (`light_mode`) |
| Dîner | `#4859A6` | `#DDE1FF` | `#001356` | Icône lune (`dark_mode`) |
| Absence des parents | `#5B6057` | `#E0E4D9` | `#181D16` | Fond hachuré + icône `flight_takeoff` |

Les couleurs déjeuner et dîner restent **discrètes** : icône et libellé de ligne, pas de fond coloré sur toute la grille. Sinon elles entrent en concurrence avec les avatars des membres.

---

## 3. Couleurs des membres (avatars)

Aucune couleur verte, pour ne pas se confondre avec le primary. Toutes offrent un contraste AA avec du texte blanc (ton 40).

| # | Teinte | Avatar (ton 40) | Fond clair (ton 90) |
|---|---|---|---|
| 1 | Framboise | `#B90C55` | `#FFD9DF` |
| 2 | Bleu | `#0060A8` | `#D3E4FF` |
| 3 | Orange brûlé | `#B02E00` | `#FFDBD1` |
| 4 | Violet | `#6F48B2` | `#EBDCFF` |
| 5 | Brun | `#79564B` | `#FFDBCF` |

Proposition : 1 à 3 pour les enfants, 4 et 5 pour les parents. Modifiable dans l'administration.

---

## 4. Tokens CSS (pour l'étape 5)

À coller dans `src/app/globals.css` à la place des tokens de Kikela. Mêmes noms de variables que Kikela, pour réutiliser les composants sans les toucher.

```css
:root {
  /* Neutres (basilic) */
  --md-surface: #f8faf0;
  --md-surface-container-low: #f2f5ea;
  --md-surface-container: #edefe5;
  --md-surface-container-high: #e7e9df;
  --md-surface-container-highest: #e1e4d9;
  --md-surface-variant: #dfe4d7;
  --md-outline: #73796e;
  --md-outline-variant: #c3c8bb;
  --md-on-surface: #191d17;
  --md-on-surface-variant: #43483e;
  --md-on-surface-muted: #73796e;
  --md-inverse-surface: #2e312b;
  --md-inverse-on-surface: #eff2e8;

  /* Primary (vert basilic, source #4F7F3A) */
  --md-primary: #436833;
  --md-primary-hover: #2c4f1d;
  --md-on-primary: #ffffff;
  --md-primary-container: #c4efac;
  --md-on-primary-container: #2c4f1d;

  /* Secondary */
  --md-secondary: #55624c;
  --md-secondary-container: #d8e7cb;
  --md-on-secondary-container: #3d4b36;

  /* Tertiary : repas ouvert */
  --md-tertiary: #386667;
  --md-tertiary-container: #bbebec;
  --md-on-tertiary-container: #1e4e4f;

  /* Erreur */
  --md-error: #ba1a1a;
  --md-error-container: #ffdad6;
  --md-on-error-container: #93000a;

  /* Créneaux */
  --creneau-dejeuner: #7d5700;
  --creneau-dejeuner-container: #ffdea9;
  --creneau-diner: #4859a6;
  --creneau-diner-container: #dde1ff;

  /* Absence des parents */
  --absence: #5b6057;
  --absence-container: #e0e4d9;

  --background: var(--md-surface);
  --foreground: var(--md-on-surface);
}
```

Manifest PWA : `theme_color: "#436833"`, `background_color: "#f8faf0"`.

### Thème sombre (réserve)

primary `#A8D292`, on-primary `#163808`, primary-container `#2C4F1D`, on-primary-container `#C4EFAC`, secondary-container `#3D4B36`, tertiary `#A0CFD0`, tertiary-container `#1E4E4F`, surface `#11140F`, surface-container `#1D211A`, surface-container-high `#282B25`, on-surface `#E1E4D9`, on-surface-variant `#C3C8BB`, outline `#8D9287`, outline-variant `#43483E`.
