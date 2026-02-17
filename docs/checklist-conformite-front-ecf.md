# Checklist de conformite ECF (Front-end)

Date: 16/02/2026  
Convention: `OK` = couvert cote front, `Partiel` = present mais incomplet, `Non couvert` = hors perimetre front actuel.

## 1) Accueil / Navigation / Footer

| Exigence | Statut | Preuve |
|---|---|---|
| Page d'accueil avec presentation entreprise | OK | `index.html:22` |
| Mise en avant equipe | OK | `index.html:24` |
| Avis clients affiches | OK | `index.html:26`, `js/main.js:55` |
| Menu: accueil, menus, connexion, contact | OK | `index.html:15` |
| Footer horaires lundi-dimanche | OK | `index.html:38`, `js/main.js:20` |
| Footer mentions legales + CGV | OK | `index.html:49` |

## 2) Vue globale des menus et filtres

| Exigence | Statut | Preuve |
|---|---|---|
| Liste globale des menus | OK | `menus.html:48`, `js/menus.js:10` |
| Affichage titre/description/min pers/prix/detail | OK | `js/menus.js:23` |
| Filtre prix max | OK | `menus.html:27`, `js/menus.js:46` |
| Filtre fourchette prix | OK | `menus.html:25`, `menus.html:27`, `js/menus.js:45` |
| Filtre theme | OK | `menus.html:29`, `js/menus.js:47` |
| Filtre regime | OK | `menus.html:37`, `js/menus.js:48` |
| Filtre nb min personnes | OK | `menus.html:44`, `js/menus.js:49` |
| Rafraichissement dynamique sans reload | OK | `js/menus.js:75` |

## 3) Detail menu et commande

| Exigence | Statut | Preuve |
|---|---|---|
| Detail complet menu visible | OK | `js/menu-detail.js:18` |
| Conditions mises en evidence | OK | `js/menu-detail.js:37` |
| Bouton commander present | OK | `menu-detail.html:15` |
| Non authentifie => redirection connexion | OK | `js/menu-detail.js:55` |
| Authentifie => redirection commande preremplie | OK | `js/menu-detail.js:58` |

## 4) Inscription / Connexion / Reset

| Exigence | Statut | Preuve |
|---|---|---|
| Creation compte (nom, prenom, gsm, adresse, email, mdp) | OK | `inscription.html:6` |
| Mdp min 10 + maj/min/chiffre/special | OK | `js/inscription.js:5` |
| Role utilisateur a l'inscription | OK | `js/inscription.js:47` |
| Connexion email + mot de passe | OK | `connexion.html:7`, `js/connexion.js:17` |
| Mot de passe oublie (demande mail) | OK | `reset-password.html:6`, `js/reset-password.js:2` |
| Mail de bienvenue/reset simule | OK | `js/inscription.js:66`, `js/reset-password.js:10` |

## 5) Commande (regles metier front)

| Exigence | Statut | Preuve |
|---|---|---|
| Preremplissage infos client connecte | OK | `js/commande.js:79` |
| Calcul livraison hors Bordeaux (5 + 0.59/km) | OK | `js/commande.js:20` |
| Minimum personnes menu impose | OK | `js/commande.js:124` |
| Remise 10% si +5 pers vs minimum | OK | `js/commande.js:17` |
| Recap detaille prix avant validation | OK | `js/commande.js:99` |
| Confirmation commande + historique statut | OK | `js/commande.js:154` |
| Mail confirmation commande simule | OK | `js/commande.js:46` |

## 6) Espace utilisateur

| Exigence | Statut | Preuve |
|---|---|---|
| Voir commandes + details + historique | OK | `js/espace-utilisateur.js:94` |
| Modifier commande avant acceptation | OK | `js/espace-utilisateur.js:112` |
| Annuler commande avant acceptation | OK | `js/espace-utilisateur.js:133` |
| Suivi statuts de commande | OK | `js/espace-utilisateur.js:94` |
| Avis note 1-5 + commentaire sur commande terminee | OK | `js/espace-utilisateur.js:68`, `js/espace-utilisateur.js:161` |

Note:
- Le choix du menu reste volontairement non modifiable, conforme a la consigne.

## 7) Espace employe

| Exigence | Statut | Preuve |
|---|---|---|
| Modifier/supprimer/ajouter menus | OK | `js/espace-employe.js:186` |
| Modifier/supprimer/ajouter plats | OK | `js/espace-employe.js:221` |
| Modifier horaires | OK | `js/espace-employe.js:149` |
| Filtrer commandes par statut et client | OK | `espace-employe.html:10`, `js/espace-employe.js:339` |
| MAJ statuts commandes | OK | `js/espace-employe.js:361` |
| Motif annulation + mode contact | OK | `js/espace-employe.js:380` |
| Validation/refus des avis | OK | `js/espace-employe.js:440` |
| Mail statut `retour` (10 jours / 600 EUR) simule | OK | `js/espace-employe.js:23`, `js/espace-employe.js:400` |

## 8) Espace administrateur

| Exigence | Statut | Preuve |
|---|---|---|
| Creation compte employe (email+mdp) | OK | `js/espace-admin.js:29` |
| Desactivation/reactivation compte employe | OK | `js/espace-admin.js:43` |
| Interdiction creation admin depuis app | OK | `espace-admin.html:8`, `js/espace-admin.js:64` |
| Peut faire tout ce qu'un employe fait | OK | `espace-admin.html:10`, `espace-admin.html:13` |
| Stats commandes par menu + comparaison graphique | OK | `js/espace-admin.js:90` |
| CA par menu + filtres periode | OK | `js/espace-admin.js:88`, `js/espace-admin.js:140` |

Note:
- Le front interdit la creation admin (UI + validation de soumission). Un controle backend reste necessaire en production.

## 9) Contact

| Exigence | Statut | Preuve |
|---|---|---|
| Form contact titre/description/email | OK | `contact.html:6` |
| Envoi vers entreprise (SMTP si configure) | OK | `js/contact.js:8`, `backend/src/routes/contact.js:1` |

## 10) Accessibilite (RGAA)

| Exigence | Statut | Preuve |
|---|---|---|
| Bases accessibilite (skip link, feedback live) | OK | `js/main.js:41`, `js/main.js:73` |
| Renfort accessibilite globale (landmarks, aria-required, captions tables, focus) | OK | `js/main.js:78`, `css/style.css:939` |
| Conformite RGAA complete | Partiel | Audit RGAA legal complet non fourni |

## 11) Hors front / hors preuve dans ce repo

| Exigence ECF | Statut |
|---|---|
| Backend securise reel (API + auth serveur) | Couvert (local) |
| Envois mails reels SMTP | Couvert (si `.env` SMTP configure) |
| SQL + NoSQL connectes cote serveur | Couvert (local) |
| Deploiement en ligne fonctionnel | Non couvert (a faire) |
| Manuels PDF, charte graphique PDF, docs UML/sequence, gestion projet | Non couvert |

## Synthese
- Cote front pur: majoritairement `OK`, avec quelques `Partiel` (RGAA complet).
- Les parcours fonctionnels critiques front sont executes automatiquement avec succes: `docs/parcours-tests-front.md`.
