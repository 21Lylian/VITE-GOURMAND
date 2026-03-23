# Documentation de deploiement - Vite & Gourmand

## 1. Prerequis
- Un depot GitHub public
- Un hebergeur API (Render/Fly.io/Railway)
- Un hebergeur front statique (Vercel/Netlify/Cloudflare Pages)

## 2. Variables d'environnement API
Base: `.env.example`

Configurer en production:
- `PORT` (souvent impose par la plateforme)
- `JWT_SECRET` (fort, unique)
- `DATABASE_URL` (base PostgreSQL distante)
- `DB_SSL` (`true` sur la plupart des hebergeurs)
- `NOSQL_PATH` (chemin persistant)

## 3. Deploiement API (exemple Render)
Le depot contient un fichier `render.yaml`.

1. Pousser le projet sur GitHub.
2. Dans Render, creer un nouveau Blueprint.
3. Pointer vers le repo GitHub.
4. Laisser Render lire `render.yaml`.
5. Renseigner les secrets demandes (`JWT_SECRET`, SMTP si besoin).
6. Lancer le provisionnement.
7. Verifier endpoint: `https://<api-domain>/api/health`

## 4. Deploiement front (GitHub Pages)
Le depot contient le workflow `.github/workflows/pages.yml`.

1. Pousser le projet sur GitHub.
2. Dans GitHub, ouvrir `Settings > Pages`.
3. Dans `Build and deployment`, choisir `GitHub Actions`.
4. Pousser sur `main` pour declencher le workflow.
5. Recuperer l'URL GitHub Pages generee.

## 5. Liaison front -> API en production
Le front lit:
- `window.API_BASE_URL` si defini
- sinon `localStorage.api_base_url`
- sinon auto `http(s)://<hostname>:3000/api`

Option recommandee:
- definir `window.API_BASE_URL` via script inline sur pages, ou
- executer une fois dans la console:
```js
localStorage.setItem("api_base_url", "https://<api-domain>/api")
```

Avec GitHub Pages, cette deuxieme option est la plus simple pour une validation ECF rapide.

## 6. Verification post-deploiement
- chargement `index.html`
- listing menus `menus.html`
- inscription + connexion
- commande et suivi
- acces admin + creation employe
- stats admin

## 7. Points de vigilance production
- forcer HTTPS uniquement
- rotation du secret JWT
- sauvegarde DB
- limitation CORS sur domaine front
- journalisation erreurs
- le store NoSQL JSON n'est pas un stockage durable de niveau production

## 8. Livrables URL attendus
- URL repo public
- URL front deploye
- URL API deployee (ou integree dans front)
