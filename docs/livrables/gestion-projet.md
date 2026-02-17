# Documentation gestion de projet - Vite & Gourmand

## 1. Methode de pilotage
Approche iterative courte par fonctionnalites metier:
- lot front public,
- lot authentification,
- lot commande/suivi,
- lot espaces employe/admin,
- lot stabilisation/tests/deploiement.

## 2. Organisation Git recommandee (ECF)
- `main`: production/livraison
- `develop`: integration
- branches de fonctionnalite:
  - `feature/front-menus`
  - `feature/auth-api`
  - `feature/orders-workflow`
  - etc.

Flux:
1. branche feature depuis `develop`,
2. developpement + test,
3. merge vers `develop`,
4. validation globale,
5. merge `develop` -> `main`.

## 3. Decoupage macro du backlog
- US-01: consultation menus et filtres dynamiques.
- US-02: inscription/connexion/reset.
- US-03: passage commande + calcul prix/livraison/remise.
- US-04: espace utilisateur (suivi/modification/annulation/avis).
- US-05: espace employe (statuts, horaires, avis, menus/plats).
- US-06: espace admin (comptes employes + stats).
- US-07: accessibilite, tests E2E, documentation.

## 4. Gestion des risques
- Risque: derive planning due au changement de stack.
  - Mitigation: conserver stack Node deja implementee.
- Risque: regression front/back.
  - Mitigation: test E2E Playwright.
- Risque: non conformite livrables ECF.
  - Mitigation: checklist finale de rendu.

## 5. Qualite et validation
- verification manuelle des parcours critiques par role,
- test automatise `npm run test:e2e`,
- revue checklist conformite.

## 6. Livrables de pilotage a produire
- lien outil projet (Notion/Trello/Jira),
- backlog avec statuts,
- captures du board (optionnel conseille),
- retrospective courte (ce qui a bien fonctionne/ameliorations).
