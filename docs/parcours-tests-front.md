# Rapport de tests parcours front

Date d'execution: 16/02/2026  
Perimetre: front-end HTML/CSS/JS + backend API local

## Outil et commande
- Outil: Playwright (Chromium headless)
- Commande executee:

```bash
npm run test:e2e
```

Resultat:
- `1 passed (8.9s)`

## Scenarios executes (Point 1)
1. Visiteur
- Ouvre `menus.html`.
- Ouvre le detail d'un menu.
- Clique `Commander ce menu`.
- Verification: redirection vers `connexion.html?next=...`.

2. Utilisateur
- Inscription via `inscription.html` avec mot de passe conforme.
- Redirection accueil apres inscription.
- Verification acces au formulaire `commande.html?id=1`.
- Creation d'une commande via API avec token utilisateur et menu disponible.
- Verification: presence d'une ligne de commande dans le tableau utilisateur.

3. Administrateur
- Connexion admin via formulaire (`admin@vite-gourmand.local`).
- Ouverture `espace-admin.html`.
- Creation d'un compte employe.
- Verification: employe visible dans la liste.

4. Employe
- Connexion employee via formulaire.
- Ouverture `espace-employe.html`.
- Verification: selecteur de statut commande visible (droits employe OK).

## Notes d'execution
- Les parcours critiques demandes ont ete executes avec succes.
- Des erreurs 404 images existent (`public/noel1.jpg`, `public/noel2.jpg`, `public/vegan1.jpg`) pendant le test: cela n'a pas bloque les parcours fonctionnels, mais il faut ajouter/corriger ces assets.
