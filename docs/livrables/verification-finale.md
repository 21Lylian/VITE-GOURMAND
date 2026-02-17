# Verification finale correcteur - Vite & Gourmand

Date: 17/02/2026

## Preconditions
- Terminal 1 (API): `npm.cmd run start:api`
- Terminal 2 (Front): `npx http-server . -p 4173 -c-1`
- URL front: `http://127.0.0.1:4173/index.html`
- Health API: `http://127.0.0.1:3000/api/health`

## Compte admin seed
- Email: `admin@vite-gourmand.local`
- Mot de passe: `Admin!12345`

## Parcours de verification
1. Peut se connecter admin
- Aller sur `connexion.html`.
- Se connecter avec le compte seed.
- Ouvrir `espace-admin.html` sans message "espace reserve".

2. Peut creer employe
- Dans `espace-admin.html`, creer un compte role employe.
- Verifier connexion employee sur `espace-employe.html`.

3. Peut passer une commande complete
- Utilisateur connecte -> `menus.html` -> `menu-detail.html` -> `commande.html`.
- Valider commande.
- Verifier affichage commande dans `espace-utilisateur.html`.

4. Peut consulter stats et avis
- En admin: verifier bloc stats commandes/chiffre d'affaires.
- En employe/admin: verifier bloc moderation avis.

## Test automatise
- Commande: `npm run test:e2e`
- Cible: `tests/front-ecf.spec.js`
- Resultat observe (17/02/2026): `1 passed`

## Critere de validation
- Aucun `Failed to fetch` sur les parcours ci-dessus.
- Les routes API renvoient 200/201 selon action.
- Les changements de statut sont visibles dans l'historique.
