# Diagrammes UML/MCD - Vite & Gourmand

## 1) MCD simplifie (entites principales)
```mermaid
erDiagram
  USERS ||--o{ ORDERS : "passe"
  USERS ||--o{ REVIEWS : "ecrit"
  MENUS ||--o{ ORDERS : "concerne"
  MENUS ||--o{ MENU_DISHES : "compose"
  DISHES ||--o{ MENU_DISHES : "associe"
  ORDERS ||--o{ ORDER_HISTORY : "historise"
  USERS ||--o{ PASSWORD_RESETS : "demande"

  USERS {
    int id PK
    string first_name
    string last_name
    string email
    string password_hash
    string role
    int active
  }
  MENUS {
    int id PK
    string title
    string description
    string theme
    string diet
    int min_persons
    float price_per_person
    int active
  }
  ORDERS {
    int id PK
    int user_id FK
    int menu_id FK
    int persons
    string status
    float total_price
    string event_date
  }
```

## 2) Cas d'utilisation (simplifie)
```mermaid
flowchart LR
  U[Utilisateur] --> UC1[Consulter les menus]
  U --> UC2[Passer commande]
  U --> UC3[Suivre/modifier/annuler commande]
  U --> UC4[Laisser un avis]

  E[Employe] --> UE1[Gerer menus et plats]
  E --> UE2[Traiter commandes]
  E --> UE3[Valider/refuser avis]
  E --> UE4[Modifier horaires]

  A[Admin] --> UA1[Creer/desactiver employe]
  A --> UA2[Consulter statistiques]
  A --> UE1
  A --> UE2
```

## 3) Sequence - parcours commande
```mermaid
sequenceDiagram
  participant Client
  participant Front
  participant API
  participant SQL
  participant NoSQL

  Client->>Front: Clique "Commander ce menu"
  Front->>API: GET /api/menus/:id
  API->>SQL: Lire menu + regles
  SQL-->>API: Donnees menu
  API-->>Front: Reponse menu
  Client->>Front: Valide formulaire commande
  Front->>API: POST /api/orders
  API->>SQL: Inserer commande + historique
  API->>NoSQL: Mettre a jour projection stats
  API-->>Front: Confirmation + recap
  Front-->>Client: Commande enregistree
```

## 4) Deploiement logique (simplifie)
```mermaid
flowchart TB
  Browser[Navigateur] --> Front[Front statique]
  Front --> API[API Node.js/Express]
  API --> SQL[(PostgreSQL)]
  API --> NOSQL[(JSON Store NoSQL stats)]
  API --> SMTP[(SMTP Mailtrap/Brevo)]
```
