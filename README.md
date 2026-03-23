# Vite & Gourmand - ECF

Application web ECF Developpeur Web / Web Mobile avec front `HTML/CSS/JS` et API Node.js securisee.

## Stack technique

- Front-end : HTML5, CSS3, JavaScript
- Back-end : Node.js, Express, JWT, bcrypt
- Base relationnelle : PostgreSQL (base distante ou conteneurisee via Docker)
- Base NoSQL : JSON document store (statistiques de commandes)
- Tests E2E : Playwright

## Deploiement en local

### Prerequis

- Node.js (LTS recommandee)
- npm
- Docker Desktop (recommande pour PostgreSQL local)

### 1) Cloner le depot

```bash
git clone <URL_DU_REPO>
cd <NOM_DU_DOSSIER>
```

### 2) Installer les dependances

```bash
npm install
```

### 3) Configurer l'environnement

Creer un fichier `.env` a partir de `.env.example`.

Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

### 4) Demarrer la base distante locale (recommande)

```bash
npm run docker:up
```

### 5) Lancer l'API (terminal 1)

```bash
npm run start:api
```

- API : `http://localhost:3000`
- Healthcheck : `http://localhost:3000/api/health`

### 6) Demarrer le front statique (terminal 2)

```bash
npx http-server . -p 4173 -c-1
```

- Front : `http://127.0.0.1:4173/index.html`

### 7) Lancer les tests E2E (optionnel)

```bash
npm run test:e2e
```

## Scripts disponibles

- `npm run start:api` : demarre l'API Node.js
- `npm run docker:up` : demarre PostgreSQL + l'API via Docker Compose
- `npm run docker:down` : arrete les conteneurs Docker
- `npm run test:e2e` : lance les tests E2E Playwright

## Deploiement production

Configuration preparee dans le depot :

- API + base PostgreSQL Render : `render.yaml`
- Front statique GitHub Pages : `.github/workflows/pages.yml`

Ordre recommande :

1. pousser le projet sur GitHub
2. creer l'API Render depuis `render.yaml`
3. recuperer l'URL publique de l'API
4. configurer le front pour utiliser cette URL via `window.API_BASE_URL` ou `localStorage.api_base_url`
5. activer GitHub Pages sur la branche `main` via GitHub Actions

Note:
- le stockage NoSQL JSON reste local au serveur et peut etre reinitialise sur certains redeploiements
- pour une persistance stricte en production, il faudra ensuite remplacer ce stockage par un vrai service NoSQL

## LE Compte administrateur  ()

- Email : `admin@vite-gourmand.local`
- Mot de passe : `Admin!12345`

## Pages principales

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

## Backend

- API par defaut : `http://localhost:3000`
- Healthcheck : `GET /api/health`
- Documentation backend : `docs/backend-setup.md`

## Liens de deploiement

- Front (GitHub Pages) : `https://21Lylian.github.io/VITE-GOURMAND/`
- Back-end API : `https://vite-gourmand-1.onrender.com/api`
- Back-end healthcheck : `https://vite-gourmand-1.onrender.com/api/health`

Note importante (Render - offre gratuite) :
- Le back-end est heberge sur l'offre gratuite de Render.
- En cas d'inactivite, le service peut se mettre en veille (cold start).
- Lors du premier acces, il faudra attendre environ 1 minute pour que le serveur redemarre completement.
- Si l'API ne repond pas immediatement, patienter 60 secondes puis recharger la page.

Fonctionnalites couvertes :

- Authentification et roles (`utilisateur`, `employe`, `admin`)
- Gestion des menus, commandes, avis, horaires, contact
- Administration des employes
- Statistiques commandes/chiffre d'affaires via stockage NoSQL

## Conformite ECF

Le projet respecte la contrainte d'utiliser :

- une base relationnelle distante : PostgreSQL (`backend/src/db/postgres.js`)
- une base NoSQL : store JSON documentaire (`backend/src/db/nosql.js`)

Le choix Node.js/Express est conserve pour la continuite technique, la rapidite de livraison, et les tests E2E en place.

## Bonnes pratiques Git

- Branche principale : `main`
- Branche de developpement : `develop`
- Developpement courant sur `develop`, puis fusion vers `main` pour les versions stables

## Dossier livrables ECF

Documents prets a convertir en PDF :

- Manuel d'utilisation : `docs/livrables/manuel-utilisation.md`
- Charte graphique : `docs/livrables/charte-graphique.md`
- Gestion de projet : `docs/livrables/gestion-projet.md`
- Documentation technique : `docs/livrables/documentation-technique.md`
- Documentation de deploiement : `docs/livrables/deploiement.md`
- Diagrammes UML/MCD : `docs/livrables/diagrammes-uml.md`
- Verification accessibilite RGAA : `docs/livrables/accessibilite-rgaa.md`
- Verification finale correcteur : `docs/livrables/verification-finale.md`
- Validation SMTP contact : `docs/livrables/validation-smtp-contact.md`
- Checklist finale de rendu : `docs/livrables/checklist-rendu-ecf.md`
