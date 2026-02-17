# UI Spec (Rendu Final)

## Direction artistique
- Positionnement: moderne chaleureux (restauration premium accessible)
- Contraste: fond clair creme + accents orange cuisine
- Typo titres: `Fraunces`
- Typo contenu: `Manrope`

## Tokens
- `--brand-cream`: fond clair
- `--brand-peach`: tonalites hero
- `--brand-orange`: action primaire
- `--brand-orange-dark`: hover
- `--brand-ink`: texte principal
- `--brand-muted`: texte secondaire
- `--brand-card`: cartes
- `--brand-line`: bordures

## Composants
- Header sticky avec pills de navigation
- Cards arrondies (`12-14px`) + ombre douce
- Boutons primaires en gradient orange
- Inputs unifies (bordure claire + focus orange)
- KPI cards (titre court + valeur forte)
- Tableaux dans container scrollable sur mobile
- Etats vides stylises (fond gris clair + bordure pointillee)

## Rythme et espaces
- Conteneur principal: `max-width ~1120px`
- Gouttiere page: `1rem`
- Espacement vertical standard sections: `1rem - 2rem`

## Responsive
- Navigation wrap en mobile
- Footer grille 4 -> 2 colonnes
- KPI 4 -> 2 -> 1 colonne selon breakpoints
- Aucune barre horizontale sur les pages principales

## Accessibilite
- Focus visible conserve
- Skip link present
- Labels de formulaire explicites
- Messages de statut visibles/aria-live
