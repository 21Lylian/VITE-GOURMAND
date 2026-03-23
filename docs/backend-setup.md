# Setup Back-end

## Prerequis
- Node.js 22+ (teste avec Node 25)

## Installation
```bash
npm install
```

## Base de donnees
Le projet utilise PostgreSQL.

Option recommandee en local:
```bash
npm run docker:up
```

## Lancement API
```bash
npm run start:api
```

API par defaut: `http://localhost:3000`

## Variables d'environnement
Copier `.env.example` vers `.env` puis adapter si necessaire.

Variables:
- `PORT`
- `JWT_SECRET`
- `DATABASE_URL`
- `DB_SSL`
- `NOSQL_PATH`

## Endpoints principaux
- `POST /api/register`
- `POST /api/login`
- `POST /api/reset-password/request`
- `POST /api/reset-password/confirm`
- `GET /api/menus`
- `GET /api/menus/:id`
- `POST /api/orders` (auth)
- `GET /api/orders` (auth)
- `PUT /api/orders/:id` (auth)
- `GET /api/me` (auth)
- `PUT /api/me` (auth)
- `GET /api/settings/hours`
- `PUT /api/settings/hours` (employe/admin)
- `POST /api/reviews` (utilisateur)
- `GET /api/reviews/me` (utilisateur)
- `GET /api/reviews/pending` (employe/admin)
- `PATCH /api/reviews/:id` (employe/admin)
- `GET /api/reviews/validated`
- `POST /api/manage/menus` (employe/admin)
- `PUT /api/manage/menus/:id` (employe/admin)
- `DELETE /api/manage/menus/:id` (employe/admin)
- `GET /api/stats/orders-by-menu` (admin)
- `POST /api/contact`
- `GET /api/contact` (employe/admin)
- `POST /api/admin/employees` (admin)
- `PATCH /api/admin/employees/:id/disable` (admin)
- `GET /api/admin/employees` (admin)

## Comptes de base
- Admin seed:
  - email: `admin@vite-gourmand.local`
  - mot de passe: `Admin!12345`
