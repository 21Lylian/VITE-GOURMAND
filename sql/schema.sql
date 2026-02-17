-- Schéma relationnel minimal pour Vite & Gourmand (exemple)
-- Tables : users, menus, plats, commandes, avis

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'utilisateur',
  gsm VARCHAR(30),
  adresse TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(200) NOT NULL,
  description TEXT,
  prix NUMERIC(8,2) NOT NULL,
  theme VARCHAR(100),
  regime VARCHAR(100),
  nb_personnes_min INTEGER NOT NULL DEFAULT 1,
  conditions TEXT,
  stock INTEGER DEFAULT 0
);

CREATE TABLE plats (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  allergenes TEXT,
  UNIQUE(nom)
);

-- association menu <-> plat (plusieurs menus peuvent partager un plat)
CREATE TABLE menu_plats (
  menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
  plat_id INTEGER REFERENCES plats(id) ON DELETE CASCADE,
  ordre INTEGER DEFAULT 0,
  PRIMARY KEY (menu_id, plat_id)
);

CREATE TABLE commandes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  menu_id INTEGER REFERENCES menus(id),
  nb_personnes INTEGER NOT NULL,
  prix_total NUMERIC(10,2) NOT NULL,
  frais_livraison NUMERIC(8,2) DEFAULT 0,
  statut VARCHAR(100) DEFAULT 'en-attente',
  historique JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  note INTEGER CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  valide BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fixtures minimal (exemple)
INSERT INTO users (nom, prenom, email, password_hash, role) VALUES ('Demo','User','demo@example.com','$2y$...','utilisateur');
INSERT INTO menus (titre, description, prix, theme, regime, nb_personnes_min, conditions, stock) VALUES
('Menu Noël','Menu festif',35.00,'noel','classique',4,'Commande 3 jours',5),
('Menu Vegan','Menu végétal',28.00,'classique','vegan',2,'Commande 2 jours',2);
