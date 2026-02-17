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
- `DB_PATH` (chemin persistant)
- `NOSQL_PATH` (chemin persistant)

## 3. Deploiement API (exemple Render)
1. Creer un service Web depuis le repo.
2. Build command: `npm install`
3. Start command: `npm run start:api`
4. Ajouter les variables d'environnement.
5. Verifier endpoint: `https://<api-domain>/api/health`

## 4. Deploiement front (exemple Vercel/Netlify)
1. Importer le meme repo.
2. Framework: `Other` / static site.
3. Dossier racine: projet.
4. Build command: aucune.
5. Publish directory: racine.

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

## 8. Livrables URL attendus
- URL repo public
- URL front deploye
- URL API deployee (ou integree dans front)
