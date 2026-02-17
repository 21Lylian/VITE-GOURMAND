# Manuel d'utilisation - Vite & Gourmand

## 1. Objectif
Cette application permet de consulter des menus traiteur, passer des commandes, suivre leur traitement, et administrer les operations internes selon les roles.

## 2. Acces application
- Front local: `http://127.0.0.1:4173/index.html`
- API locale: `http://localhost:3000`
- Sante API: `http://localhost:3000/api/health`

## 3. Comptes de test
- Administrateur (seed):
  - Email: `admin@vite-gourmand.local`
  - Mot de passe: `Admin!12345`
- Utilisateur: creation via `inscription.html`
- Employe: creation par administrateur via `espace-admin.html`

## 4. Parcours visiteur
1. Ouvrir `menus.html`.
2. Filtrer les menus par prix/theme/regime/nombre de personnes.
3. Ouvrir un detail menu.
4. Cliquer sur `Commander`.
5. Se connecter ou creer un compte pour finaliser la commande.

## 5. Parcours utilisateur
1. Se connecter.
2. Commander un menu.
3. Consulter `espace-utilisateur.html`:
   - suivi des statuts,
   - modification/annulation avant acceptation,
   - depot d'avis (note/commentaire) en fin de cycle.

## 6. Parcours employe
1. Se connecter avec un compte role `employe`.
2. Ouvrir `espace-employe.html`.
3. Actions disponibles:
   - gestion menus/plats/horaires,
   - filtrage commandes,
   - mise a jour des statuts,
   - validation/refus des avis.

## 7. Parcours administrateur
1. Se connecter avec le compte admin.
2. Ouvrir `espace-admin.html`.
3. Actions supplementaires:
   - creation/desactivation comptes employes,
   - consultation stats commandes/chiffre d'affaires.

## 8. Statuts commande
- `en-attente`
- `accepte`
- `en-preparation`
- `en-cours-livraison`
- `livre`
- `en-attente-retour-materiel`
- `terminee`
- `annule`

## 9. Limites connues
- Envois e-mails reels possibles si SMTP configure dans `.env`.
- Images de production a integrer.

## 10. Assistance
En cas d'erreur `Failed to fetch`:
1. Verifier API active (`/api/health`).
2. Verifier serveur front actif.
3. Vider une ancienne URL API locale:
```js
localStorage.removeItem("api_base_url")
```
