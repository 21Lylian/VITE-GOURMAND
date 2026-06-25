# Documentation Product Owner - Vite & Gourmand

## 1. Role du Product Owner

Dans le projet, le Product Owner represente les besoins metier du traiteur "Vite & Gourmand". Son role est de clarifier la vision produit, prioriser les fonctionnalites, definir les criteres d'acceptation et verifier que l'application repond aux besoins des utilisateurs.

Responsabilites PO:

- identifier les utilisateurs cibles,
- formuler les besoins sous forme de user stories,
- prioriser le backlog,
- definir les criteres d'acceptation,
- valider les parcours principaux avant livraison.

## 2. Vision produit

Vite & Gourmand est une application web permettant a un client de consulter des menus traiteur, commander un menu, suivre sa commande et laisser un avis. L'application permet aussi au personnel de gerer les menus, traiter les commandes, moderer les avis et suivre l'activite.

Objectif principal:

> Centraliser la presentation des menus, la prise de commande et le suivi client dans une application simple a utiliser, securisee et exploitable par l'equipe du traiteur.

## 3. Utilisateurs cibles

### Client

Le client consulte les menus, cree un compte, passe commande, suit son statut et peut laisser un avis apres une prestation.

### Employe

L'employe gere les menus, traite les commandes, met a jour les statuts, modere les avis et consulte les informations utiles au service.

### Administrateur

L'administrateur pilote l'application, cree ou desactive des comptes employes, consulte les statistiques et garde une vision globale de l'activite.

## 4. Backlog priorise

| Priorite | Fonctionnalite | Utilisateur | Statut |
|---|---|---|---|
| Must have | Consulter les menus | Client | Fait |
| Must have | Creer un compte et se connecter | Client | Fait |
| Must have | Passer une commande | Client | Fait |
| Must have | Suivre une commande | Client | Fait |
| Must have | Gerer les statuts de commande | Employe/Admin | Fait |
| Must have | Gerer les menus | Employe/Admin | Fait |
| Should have | Laisser et moderer un avis | Client/Employe/Admin | Fait |
| Should have | Gerer les horaires | Employe/Admin | Fait |
| Should have | Consulter les statistiques | Admin | Fait |
| Could have | Envoyer un email de contact via SMTP | Visiteur | Prepare |
| Could have | Remplacer le store NoSQL JSON par MongoDB | Admin | Amelioration |

## 5. User stories et criteres d'acceptation

### US01 - Consulter les menus

En tant que visiteur, je veux consulter les menus disponibles afin de choisir une prestation adaptee.

Criteres d'acceptation:

- la page `menus.html` affiche les menus disponibles,
- un menu peut etre ouvert en detail,
- les informations principales sont visibles: titre, description, prix, nombre minimum de personnes.

### US02 - Creer un compte

En tant que client, je veux creer un compte afin de passer une commande et retrouver mon suivi.

Criteres d'acceptation:

- le formulaire d'inscription controle les champs obligatoires,
- le mot de passe est hache en base,
- le role par defaut est `utilisateur`,
- un compte admin ne peut pas etre cree depuis l'interface publique.

### US03 - Passer une commande

En tant que client connecte, je veux commander un menu pour une date et une heure donnees.

Criteres d'acceptation:

- la commande exige un utilisateur connecte,
- le nombre de personnes respecte le minimum du menu,
- le prix total est calcule avec les frais et remises,
- la commande est enregistree en SQL,
- le stock du menu est mis a jour,
- une projection NoSQL est creee pour les statistiques.

### US04 - Suivre et modifier une commande

En tant que client, je veux suivre ma commande et pouvoir la modifier tant qu'elle n'est pas encore acceptee.

Criteres d'acceptation:

- le client voit uniquement ses commandes,
- la modification est bloquee si la commande est deja acceptee ou traitee,
- l'annulation remet le stock a jour quand elle est autorisee,
- l'historique de statut est conserve.

### US05 - Traiter une commande

En tant qu'employe, je veux changer le statut d'une commande afin de suivre son avancement.

Criteres d'acceptation:

- seuls les roles `employe` et `admin` peuvent traiter les commandes,
- les transitions de statuts sont controlees,
- une note de suivi est demandee,
- chaque changement est historise.

### US06 - Administrer les employes

En tant qu'administrateur, je veux creer ou desactiver un employe afin de gerer les acces internes.

Criteres d'acceptation:

- seul le role `admin` peut creer un employe,
- l'email doit etre unique,
- un employe desactive ne doit plus pouvoir acceder a son espace.

## 6. Definition of Done

Une fonctionnalite est consideree terminee si:

- le parcours utilisateur est accessible depuis l'interface,
- les controles de securite sont appliques cote API,
- les donnees sont persistees dans la bonne source,
- les erreurs principales sont gerees,
- le comportement est documente dans les livrables,
- le parcours critique est couvert par verification manuelle ou test Playwright.

## 7. Liens avec le code

- Front: fichiers `*.html`, `css/style.css`, `js/*.js`
- API: `backend/src/app.js`
- Routes: `backend/src/routes`
- Services: `backend/src/services`
- Repositories: `backend/src/repositories`
- Base SQL: `sql/schema.sql`
- NoSQL: `backend/src/db/nosql.js`
