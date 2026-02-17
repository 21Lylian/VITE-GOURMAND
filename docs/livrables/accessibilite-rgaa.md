# Verification accessibilite RGAA - Vite & Gourmand

Date: 17/02/2026

## 1. Verification de base RGAA
- Structure semantique presente (header/main/footer) sur les pages principales.
- Focus visible sur les elements interactifs.
- Labels de formulaires presents.
- Messages de statut en `aria-live` pour les retours utilisateur.
- Navigation clavier possible sur les parcours critiques.
- Contraste a verifier composant par composant (controle manuel reste requis).

## 2. Correctifs critiques appliques
- Skip link present pour aller au contenu principal.
- Ajout/renfort d'attributs ARIA sur composants de feedback.
- Champs obligatoires explicites.
- Tableaux encapsules pour meilleure lisibilite mobile.
- Etats vides et erreurs visibles avec texte explicite.

## 3. Limites restantes (a expliciter au jury)
- Pas d'audit RGAA legal complet (grille officielle complete non produite).
- Pas de campagne lecteur d'ecran documentee (NVDA/JAWS/VoiceOver).
- Contrastes a valider sur tous les ecrans apres ajout des images finales.
- Pas de declaration d'accessibilite formelle publiee.

## 4. Plan rapide de cloture
1. Lancer un audit axe/Lighthouse sur toutes les pages.
2. Corriger les erreurs bloquees (niveau A prioritaire).
3. Tester clavier + lecteur d'ecran sur 3 parcours:
   - inscription/connexion,
   - commande complete,
   - gestion admin.
4. Ajouter une declaration d'accessibilite en annexe PDF.
