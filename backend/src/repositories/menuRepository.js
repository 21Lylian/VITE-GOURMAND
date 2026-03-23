const { one, many, query } = require("../db/postgres");

function parseJson(value, fallback = []) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (_err) {
      return fallback;
    }
  }
  return value;
}

function mapMenu(row) {
  if (!row) return null;
  return {
    id: row.id,
    titre: row.titre,
    description: row.description,
    prix: Number(row.prix),
    theme: row.theme,
    regime: row.regime,
    nb_personnes_min: row.nb_personnes_min,
    conditions_text: row.conditions_text,
    stock: row.stock,
    images_json: parseJson(row.images_json, [])
  };
}

async function findAll(filters = {}, client = null) {
  const conditions = [];
  const values = [];
  let index = 1;
  const { prixMin, prixMax, theme, regime, nbPersonnes } = filters;

  if (prixMin !== undefined) {
    conditions.push(`prix >= $${index++}`);
    values.push(Number(prixMin));
  }
  if (prixMax !== undefined) {
    conditions.push(`prix <= $${index++}`);
    values.push(Number(prixMax));
  }
  if (theme) {
    conditions.push(`theme = $${index++}`);
    values.push(String(theme).toLowerCase());
  }
  if (regime) {
    conditions.push(`regime = $${index++}`);
    values.push(String(regime).toLowerCase());
  }
  if (nbPersonnes !== undefined) {
    conditions.push(`nb_personnes_min >= $${index++}`);
    values.push(Number(nbPersonnes));
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await many(`
    SELECT id, titre, description, prix, theme, regime, nb_personnes_min, conditions_text, stock, images_json
    FROM menus
    ${whereClause}
    ORDER BY id ASC
  `, values, client);
  return rows.map(mapMenu);
}

async function findById(id, client = null) {
  const row = await one(`
    SELECT id, titre, description, prix, theme, regime, nb_personnes_min, conditions_text, stock, images_json
    FROM menus
    WHERE id = $1
  `, [id], client);
  return mapMenu(row);
}

async function findMenuForOrder(id, client = null) {
  const row = await one(`
    SELECT id, titre, prix, nb_personnes_min, stock
    FROM menus
    WHERE id = $1
  `, [id], client);
  return row ? {
    id: row.id,
    titre: row.titre,
    prix: Number(row.prix),
    nb_personnes_min: row.nb_personnes_min,
    stock: row.stock
  } : null;
}

async function findDishesByMenuId(menuId, client = null) {
  const rows = await many(`
    SELECT d.id, d.type, d.nom, d.allergenes_json
    FROM dishes d
    JOIN menu_dishes md ON md.dish_id = d.id
    WHERE md.menu_id = $1
    ORDER BY d.id ASC
  `, [menuId], client);
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    nom: row.nom,
    allergenes: parseJson(row.allergenes_json, [])
  }));
}

async function replaceMenuDishes(menuId, dishes, client = null) {
  await query("DELETE FROM menu_dishes WHERE menu_id = $1", [menuId], client);
  for (const dish of dishes) {
    const createdDish = await one(`
      INSERT INTO dishes (type, nom, allergenes_json)
      VALUES ($1, $2, $3::jsonb)
      RETURNING id
    `, [dish.type, dish.nom, JSON.stringify(dish.allergenes)], client);
    await query("INSERT INTO menu_dishes (menu_id, dish_id) VALUES ($1, $2)", [menuId, createdDish.id], client);
  }
}

async function createMenu(menu, client = null) {
  const row = await one(`
    INSERT INTO menus (titre, description, prix, theme, regime, nb_personnes_min, conditions_text, stock, images_json)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
    RETURNING id
  `, [
    menu.titre,
    menu.description,
    menu.prix,
    menu.theme,
    menu.regime,
    menu.nbPersonnes,
    menu.conditions,
    menu.stock,
    JSON.stringify(menu.images)
  ], client);
  return row.id;
}

async function updateMenu(menuId, menu, client = null) {
  await query(`
    UPDATE menus
    SET titre = $1, description = $2, prix = $3, theme = $4, regime = $5,
        nb_personnes_min = $6, conditions_text = $7, stock = $8, images_json = $9::jsonb
    WHERE id = $10
  `, [
    menu.titre,
    menu.description,
    menu.prix,
    menu.theme,
    menu.regime,
    menu.nbPersonnes,
    menu.conditions,
    menu.stock,
    JSON.stringify(menu.images),
    menuId
  ], client);
}

async function deleteMenu(menuId, client = null) {
  await query("DELETE FROM menu_dishes WHERE menu_id = $1", [menuId], client);
  await query("DELETE FROM menus WHERE id = $1", [menuId], client);
  await query(`
    DELETE FROM dishes
    WHERE id IN (
      SELECT d.id
      FROM dishes d
      LEFT JOIN menu_dishes md ON md.dish_id = d.id
      WHERE md.dish_id IS NULL
    )
  `, [], client);
}

async function countOrdersByMenu(menuId, onlyActive = false, client = null) {
  const disallowed = onlyActive ? "AND statut NOT IN ('annule', 'terminee')" : "";
  const row = await one(`
    SELECT COUNT(*)::int AS count
    FROM orders
    WHERE menu_id = $1
    ${disallowed}
  `, [menuId], client);
  return row ? row.count : 0;
}

async function increaseStock(menuId, amount = 1, client = null) {
  await query("UPDATE menus SET stock = stock + $1 WHERE id = $2", [amount, menuId], client);
}

async function decreaseStock(menuId, amount = 1, client = null) {
  await query("UPDATE menus SET stock = stock - $1 WHERE id = $2", [amount, menuId], client);
}

module.exports = {
  findAll,
  findById,
  findMenuForOrder,
  findDishesByMenuId,
  replaceMenuDishes,
  createMenu,
  updateMenu,
  deleteMenu,
  countOrdersByMenu,
  increaseStock,
  decreaseStock
};
