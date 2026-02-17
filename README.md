# Vite & Gourmand — ECF Full Stack

Application ECF Web/Web Mobile avec front `HTML/CSS/JS` et API Node.js sécurisée.

 Stack
- Front: HTML5, CSS3, JavaScript
- Back: Node.js, Express, JWT, bcrypt
- Relationnel: SQLite (fichier local)
- NoSQL: JSON document store (stats commandes)
- Tests E2E: Playwright

 Lancer le projet en local
1. Installer les dependances:
```bash
npm install
```
2. Lancer l'API:
```bash
npm run start:api
```
3. Lancer le front statique (au choix):
```bash
npx http-server . -p 4173 -c-1
```
4. Ouvrir `http://127.0.0.1:4173/index.html`.

 Compte administrateur seed
- Email: `admin@vite-gourmand.local`
- Mot de passe: `Admin!12345`

 Pages principales
- `index.html`
- `menus.html`
- `menu-detail.html`
- `commande.html`
- `inscription.html`
- `connexion.html`
- `reset-password.html`
- `espace-utilisateur.html`
- `espace-employe.html`
- `espace-admin.html`
- `contact.html`
- `mentions-legales.html`
- `cgv.html`

 Backend
- API par defaut: `http://localhost:3000`
- Healthcheck: `GET /api/health`
- Documentation backend: `docs/backend-setup.md`

Fonctionnalites couvertes:
- Authentification et roles (`utilisateur`, `employe`, `admin`)
- Gestion menus, commandes, avis, horaires, contact
- Administration employes
- Statistiques commandes/chiffre d'affaires via stockage NoSQL

 Tests
- Lancer les tests E2E:
```bash
npm run test:e2e
```

 Notes
- Les envois mails contact supportent SMTP reel si `.env` est configure.
- Les images de production ne sont pas encore integrees (placeholders/paths de demo).

 Dossier livrables ECF
Documents prets a convertir en PDF:
- Manuel d'utilisation: `docs/livrables/manuel-utilisation.md`
- Charte graphique: `docs/livrables/charte-graphique.md`
- Gestion de projet: `docs/livrables/gestion-projet.md`
- Documentation technique: `docs/livrables/documentation-technique.md`
- Documentation de deploiement: `docs/livrables/deploiement.md`
- Diagrammes UML/MCD: `docs/livrables/diagrammes-uml.md`
- Verification accessibilite RGAA: `docs/livrables/accessibilite-rgaa.md`
- Verification finale correcteur: `docs/livrables/verification-finale.md`
- Validation SMTP contact: `docs/livrables/validation-smtp-contact.md`
- Checklist finale de rendu: `docs/livrables/checklist-rendu-ecf.md`

 Conformite au sujet ECF
- PHP/PDO est cite dans le sujet comme exemple de stack possible, pas comme obligation.
- Les exigences obligatoires sont l'utilisation d'une base relationnelle et d'une base NoSQL.
- Ce projet respecte cette contrainte avec:
  - Relationnel: SQLite (`backend/src/db/sqlite.js`)
  - NoSQL: store JSON documentaire pour les stats (`backend/src/db/nosql.js`)
- Le choix Node.js/Express est conserve et justifie par la continuite technique, la rapidite de livraison, et les tests E2E en place.
