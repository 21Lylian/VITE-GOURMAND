# Documentation technique - Vite & Gourmand

## 1. Choix technologiques
- Front: HTML/CSS/JS
- Back: Node.js + Express
- Securite: JWT, bcrypt, controle des roles
- SQL relationnel: SQLite
- NoSQL: document JSON (stats commandes)

Justification:
- PHP/PDO est cite comme exemple dans le sujet, pas impose.
- L'obligation est SQL + NoSQL, respectee dans cette implementation.

## 2. Environnement de travail
- Node.js 22+ (teste Node 25)
- npm
- navigateur moderne
- PowerShell (Windows)

## 3. Architecture applicative
- Front statique multi-pages:
  - pages publiques: accueil/menus/detail/contact
  - pages privees: utilisateur/employe/admin
- API REST:
  - auth, me, menus, orders, reviews, settings, admin, stats, contact
- Persistence:
  - SQL: entites metier transactionnelles
  - NoSQL: agregats analytiques commandes

## 4. Base relationnelle (SQL)
Fichier: `backend/src/db/sqlite.js`

Tables principales:
- `users`
- `menus`
- `dishes`
- `menu_dishes`
- `orders`
- `order_history`
- `reviews`
- `contacts`
- `settings`
- `password_resets`

## 5. Base non relationnelle (NoSQL)
Fichier: `backend/src/db/nosql.js`

Usage:
- projection commandes pour statistiques
- endpoint admin `GET /api/stats/orders-by-menu`
- filtres `menuId`, `dateFrom`, `dateTo`

## 6. Securite appliquee
- hash mot de passe (`bcryptjs`)
- tokens JWT (`jsonwebtoken`)
- middleware auth + roles (`backend/src/middleware/auth.js`)
- validation des transitions de statuts (`backend/src/utils/statusRules.js`)
- headers securite via `helmet`
- CORS active

## 7. Regles metier majeures
- mot de passe fort obligatoire a l'inscription,
- role `utilisateur` par defaut,
- minimum personnes par menu pour commander,
- remise 10% si seuil depasse,
- frais livraison hors Bordeaux,
- restrictions modifications/annulations selon statut/role,
- creation admin interdite via UI et controle API.

## 8. Tests
- E2E Playwright: `tests/front-ecf.spec.js`
- commande:
```bash
npm run test:e2e
```

## 9. Diagrammes a joindre au rendu
Les diagrammes sont fournis en version source Markdown/Mermaid:
- `docs/livrables/diagrammes-uml.md`

Pour le rendu ECF:
1. ouvrir le fichier dans un viewer Mermaid ou VS Code + extension Mermaid,
2. exporter en PDF,
3. joindre ce PDF avec les autres livrables.

## 10. Limites et ameliorations
- stockage NoSQL cible (MongoDB) possible en remplacement du JSON local,
- audit RGAA legal complet a formaliser (la base RGAA est documentee),
- industrialisation CI/CD.

## 11. SMTP contact (etat actuel)
- Route contact: `backend/src/routes/contact.js`
- Envoi reel possible via SMTP (Mailtrap/Brevo/etc.) avec:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `CONTACT_TO`
  - `CONTACT_FROM`
- Si SMTP absent: message enregistre en base + avertissement API.
