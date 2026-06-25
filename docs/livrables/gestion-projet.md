# Documentation gestion de projet - Vite & Gourmand

## 0. Role Product Owner

Le role Product Owner est documente dans `docs/livrables/product-owner.md`.

Synthese:

- vision produit: faciliter la consultation des menus, la prise de commande et le suivi client,
- utilisateurs cibles: client, employe, administrateur,
- priorisation: backlog classe en Must have, Should have et Could have,
- validation: criteres d'acceptation par user story,
- controle final: parcours critiques verifies avant livraison.

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

## 3. Backlog fonctionnel synthetique

| Priorite | Besoin | Role concerne | Livraison |
|---|---|---|---|
| Must have | Consulter les menus | Visiteur/Client | Fait |
| Must have | Inscription et connexion | Client | Fait |
| Must have | Passage de commande | Client | Fait |
| Must have | Suivi et modification de commande | Client | Fait |
| Must have | Traitement des commandes | Employe/Admin | Fait |
| Must have | Gestion des menus | Employe/Admin | Fait |
| Should have | Avis clients et moderation | Client/Employe/Admin | Fait |
| Should have | Statistiques commandes | Admin | Fait |
| Could have | SMTP contact complet en production | Visiteur | Prepare |

## 4. Tracabilite PO vers le code

- Besoin commande: `commande.html`, `js/commande.js`, `backend/src/routes/orders.js`, `backend/src/services/orderService.js`
- Besoin menus: `menus.html`, `menu-detail.html`, `backend/src/routes/menus.js`, `backend/src/services/menuService.js`
- Besoin authentification: `connexion.html`, `inscription.html`, `backend/src/routes/auth.js`, `backend/src/services/authService.js`
- Besoin administration: `espace-admin.html`, `backend/src/routes/admin.js`, `backend/src/services/adminService.js`

## 5. Gestion des risques

- Risque: derive planning due au changement de stack.
  - Mitigation: conserver stack Node deja implementee.
- Risque: regression front/back.
  - Mitigation: test E2E Playwright.
- Risque: non conformite livrables ECF.
  - Mitigation: checklist finale de rendu.
- Risque: architecture backend peu visible depuis GitHub Pages.
  - Mitigation: README enrichi avec architecture, patterns et liens directs vers les dossiers backend.

## 6. Qualite et validation

- verification manuelle des parcours critiques par role,
- test automatise `npm run test:e2e`,
- revue checklist conformite,
- documentation des patterns dans `README.md` et `docs/livrables/documentation-technique.md`.

## 7. Livrables de pilotage a produire

- lien outil projet (Notion/Trello/Jira),
- backlog avec statuts,
- documentation Product Owner,
- captures du board (optionnel conseille),
- retrospective courte (ce qui a bien fonctionne/ameliorations).
