const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { DB_PATH } = require("../config");
const { hashPassword } = require("../utils/password");

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

function createSchema() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'utilisateur',
      gsm TEXT,
      adresse TEXT,
      disabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      description TEXT NOT NULL,
      prix REAL NOT NULL,
      theme TEXT NOT NULL,
      regime TEXT NOT NULL,
      nb_personnes_min INTEGER NOT NULL,
      conditions_text TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      images_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      nom TEXT NOT NULL,
      allergenes_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS menu_dishes (
      menu_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      PRIMARY KEY (menu_id, dish_id),
      FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
      FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      nb_personnes INTEGER NOT NULL,
      client_nom TEXT NOT NULL,
      client_prenom TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_gsm TEXT NOT NULL,
      adresse TEXT NOT NULL,
      ville TEXT NOT NULL,
      km REAL NOT NULL DEFAULT 0,
      date_prestation TEXT NOT NULL,
      heure_prestation TEXT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'en-attente',
      remise REAL NOT NULL DEFAULT 0,
      frais_livraison REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (menu_id) REFERENCES menus(id)
    );

    CREATE TABLE IF NOT EXISTS order_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      note INTEGER NOT NULL,
      commentaire TEXT,
      valide INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

function hasRows(table) {
  const row = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get();
  return row.c > 0;
}

function seedMenus() {
  if (hasRows("menus")) return;

  const insertMenu = db.prepare(`
    INSERT INTO menus (titre, description, prix, theme, regime, nb_personnes_min, conditions_text, stock, images_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMenu.run(
    "Menu Noel",
    "Un menu festif pour Noel avec produits de saison.",
    140,
    "noel",
    "classique",
    4,
    "Commande 3 jours a l'avance minimum. Maintien au froid obligatoire.",
    5,
    JSON.stringify(["public/noel1.jpg.jpg", "public/noel2.jpg.jpg"])
  );
  insertMenu.run(
    "Menu Vegan",
    "Une offre complete 100% vegetale.",
    84,
    "classique",
    "vegan",
    2,
    "Commande 2 jours a l'avance minimum.",
    8,
    JSON.stringify(["public/vegan1.jpg.jpg"])
  );
  const insertDish = db.prepare(`
    INSERT INTO dishes (type, nom, allergenes_json) VALUES (?, ?, ?)
  `);
  insertDish.run("Entree", "Veloute de potimarron", JSON.stringify(["lait"]));
  insertDish.run("Plat", "Chapon roti", JSON.stringify(["gluten"]));
  insertDish.run("Dessert", "Buche maison", JSON.stringify(["oeufs", "lait"]));
  insertDish.run("Entree", "Carpaccio de betterave", JSON.stringify([]));
  insertDish.run("Plat", "Curry de legumes", JSON.stringify(["soja"]));
  insertDish.run("Dessert", "Mousse coco mangue", JSON.stringify([]));

  const insertLink = db.prepare(`INSERT INTO menu_dishes (menu_id, dish_id) VALUES (?, ?)`);
  [[1, 1], [1, 2], [1, 3], [2, 4], [2, 5], [2, 6]].forEach(([m, d]) => {
    insertLink.run(m, d);
  });
}

function cleanupRemovedMenus() {
  const rows = db.prepare("SELECT id FROM menus WHERE titre = ?").all("Menu Paques");
  if (!rows.length) return;

  for (const row of rows) {
    const menuId = row.id;
    db.prepare(`
      DELETE FROM order_history
      WHERE order_id IN (SELECT id FROM orders WHERE menu_id = ?)
    `).run(menuId);
    db.prepare(`
      DELETE FROM reviews
      WHERE order_id IN (SELECT id FROM orders WHERE menu_id = ?)
    `).run(menuId);
    db.prepare("DELETE FROM orders WHERE menu_id = ?").run(menuId);
    db.prepare("DELETE FROM menu_dishes WHERE menu_id = ?").run(menuId);
    db.prepare("DELETE FROM menus WHERE id = ?").run(menuId);
  }

  db.prepare(`
    DELETE FROM dishes
    WHERE id NOT IN (SELECT DISTINCT dish_id FROM menu_dishes)
  `).run();
}

function migrateMenuImagePaths() {
  const rows = db.prepare("SELECT id, images_json FROM menus").all();
  const update = db.prepare("UPDATE menus SET images_json = ? WHERE id = ?");
  const mapping = {
    "public/noel1.jpg": "public/noel1.jpg.jpg",
    "public/noel2.jpg": "public/noel2.jpg.jpg",
    "public/vegan1.jpg": "public/vegan1.jpg.jpg"
  };

  rows.forEach((row) => {
    let images = [];
    try {
      images = JSON.parse(row.images_json || "[]");
    } catch (_err) {
      images = [];
    }
    const next = images.map((src) => mapping[src] || src);
    if (JSON.stringify(next) !== JSON.stringify(images)) {
      update.run(JSON.stringify(next), row.id);
    }
  });
}

async function seedAdmin() {
  const admin = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@vite-gourmand.local");
  if (admin) return;
  const passwordHash = await hashPassword("Admin!12345");
  db.prepare(`
    INSERT INTO users (nom, prenom, email, password_hash, role, gsm, adresse, disabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `).run("Admin", "System", "admin@vite-gourmand.local", passwordHash, "admin", "0600000001", "Bordeaux");
}

function seedSettings() {
  const hasHours = db.prepare("SELECT key FROM settings WHERE key = 'business_hours'").get();
  if (hasHours) return;
  const defaultHours = {
    lundi: "8h-20h",
    mardi: "8h-20h",
    mercredi: "8h-20h",
    jeudi: "8h-20h",
    vendredi: "8h-20h",
    samedi: "8h-20h",
    dimanche: "8h-20h"
  };
  db.prepare("INSERT INTO settings (key, value_json) VALUES (?, ?)").run("business_hours", JSON.stringify(defaultHours));
}

async function initDb() {
  createSchema();
  cleanupRemovedMenus();
  seedMenus();
  migrateMenuImagePaths();
  seedSettings();
  await seedAdmin();
}

module.exports = {
  db,
  initDb
};
