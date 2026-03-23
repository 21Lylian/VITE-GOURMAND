const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { DATABASE_URL, DB_SSL, DB_SCHEMA_PATH } = require("../config");
const { hashPassword } = require("../utils/password");

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DB_SSL ? { rejectUnauthorized: false } : false
});

function getExecutor(client) {
  return client || pool;
}

async function query(text, params = [], client = null) {
  const executor = getExecutor(client);
  return executor.query(text, params);
}

async function one(text, params = [], client = null) {
  const result = await query(text, params, client);
  return result.rows[0] || null;
}

async function many(text, params = [], client = null) {
  const result = await query(text, params, client);
  return result.rows;
}

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function hasRows(tableName, client = null) {
  const row = await one(`SELECT COUNT(*)::int AS count FROM ${tableName}`, [], client);
  return Boolean(row && row.count > 0);
}

async function createSchema() {
  const schemaPath = DB_SCHEMA_PATH || path.join(process.cwd(), "sql", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await query(schemaSql);
}

async function seedMenus(client) {
  if (await hasRows("menus", client)) return;

  const menuNoel = await one(`
    INSERT INTO menus (titre, description, prix, theme, regime, nb_personnes_min, conditions_text, stock, images_json)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
    RETURNING id
  `, [
    "Menu Noel",
    "Un menu festif pour Noel avec produits de saison.",
    140,
    "noel",
    "classique",
    4,
    "Commande 3 jours a l'avance minimum. Maintien au froid obligatoire.",
    5,
    JSON.stringify(["public/noel1.jpg.jpg", "public/noel2.jpg.jpg"])
  ], client);

  const menuVegan = await one(`
    INSERT INTO menus (titre, description, prix, theme, regime, nb_personnes_min, conditions_text, stock, images_json)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
    RETURNING id
  `, [
    "Menu Vegan",
    "Une offre complete 100% vegetale.",
    84,
    "classique",
    "vegan",
    2,
    "Commande 2 jours a l'avance minimum.",
    8,
    JSON.stringify(["public/vegan1.jpg.jpg"])
  ], client);

  const dishes = [
    ["Entree", "Veloute de potimarron", ["lait"]],
    ["Plat", "Chapon roti", ["gluten"]],
    ["Dessert", "Buche maison", ["oeufs", "lait"]],
    ["Entree", "Carpaccio de betterave", []],
    ["Plat", "Curry de legumes", ["soja"]],
    ["Dessert", "Mousse coco mangue", []]
  ];

  const dishIds = [];
  for (const [type, nom, allergenes] of dishes) {
    const dish = await one(`
      INSERT INTO dishes (type, nom, allergenes_json)
      VALUES ($1, $2, $3::jsonb)
      RETURNING id
    `, [type, nom, JSON.stringify(allergenes)], client);
    dishIds.push(dish.id);
  }

  const links = [
    [menuNoel.id, dishIds[0]],
    [menuNoel.id, dishIds[1]],
    [menuNoel.id, dishIds[2]],
    [menuVegan.id, dishIds[3]],
    [menuVegan.id, dishIds[4]],
    [menuVegan.id, dishIds[5]]
  ];

  for (const [menuId, dishId] of links) {
    await query("INSERT INTO menu_dishes (menu_id, dish_id) VALUES ($1, $2)", [menuId, dishId], client);
  }
}

async function seedAdmin(client) {
  const admin = await one("SELECT id FROM users WHERE email = $1", ["admin@vite-gourmand.local"], client);
  if (admin) return;
  const passwordHash = await hashPassword("Admin!12345");
  await query(`
    INSERT INTO users (nom, prenom, email, password_hash, role, gsm, adresse, disabled)
    VALUES ($1, $2, $3, $4, $5, $6, $7, false)
  `, ["Admin", "System", "admin@vite-gourmand.local", passwordHash, "admin", "0600000001", "Bordeaux"], client);
}

async function seedSettings(client) {
  const hasHours = await one("SELECT key FROM settings WHERE key = 'business_hours'", [], client);
  if (hasHours) return;
  const defaultHours = {
    lundi: "8h-20h",
    mardi: "8h-20h",
    mercredi: "8h-20h",
    jeudi: "8h-20h",
    vendredi: "8h-20h",
    samedi: "8h-20h",
    dimanche: "8h-19h"
  };
  await query("INSERT INTO settings (key, value_json) VALUES ($1, $2::jsonb)", ["business_hours", JSON.stringify(defaultHours)], client);
}

async function initDb() {
  await createSchema();
  await withTransaction(async (client) => {
    await seedMenus(client);
    await seedSettings(client);
    await seedAdmin(client);
  });
}

module.exports = {
  pool,
  query,
  one,
  many,
  withTransaction,
  initDb
};
