const { one, many, query } = require("../db/postgres");

async function createOrder(data, client = null) {
  const row = await one(`
    INSERT INTO orders (
      user_id, menu_id, nb_personnes, client_nom, client_prenom, client_email, client_gsm,
      adresse, ville, km, date_prestation, heure_prestation, statut, remise, frais_livraison, total
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'en-attente', $13, $14, $15)
    RETURNING id
  `, [
    data.userId,
    data.menuId,
    data.nbPersonnes,
    data.clientNom,
    data.clientPrenom,
    data.clientEmail,
    data.clientGSM,
    data.adresse,
    data.ville,
    data.km,
    data.date,
    data.heure,
    data.remise,
    data.fraisLivraison,
    data.total
  ], client);
  return row.id;
}

async function addHistory(orderId, status, note, client = null) {
  await query(`
    INSERT INTO order_history (order_id, status, note)
    VALUES ($1, $2, $3)
  `, [orderId, status, note], client);
}

async function findById(orderId, client = null) {
  return one(`
    SELECT o.*, m.titre AS menu_titre
    FROM orders o
    JOIN menus m ON m.id = o.menu_id
    WHERE o.id = $1
  `, [orderId], client);
}

async function findHistory(orderId, client = null) {
  return many(`
    SELECT status, note, changed_at AS at
    FROM order_history
    WHERE order_id = $1
    ORDER BY id ASC
  `, [orderId], client);
}

async function findMany({ user, status, clientSearch }, client = null) {
  const conditions = [];
  const values = [];
  let index = 1;
  if (user.role === "utilisateur") {
    conditions.push(`o.user_id = $${index++}`);
    values.push(user.id);
  }
  if (status) {
    conditions.push(`o.statut = $${index++}`);
    values.push(status);
  }
  if (clientSearch && user.role !== "utilisateur") {
    const pattern = `%${String(clientSearch).toLowerCase()}%`;
    conditions.push(`(LOWER(o.client_nom) LIKE $${index} OR LOWER(o.client_prenom) LIKE $${index + 1} OR LOWER(o.client_email) LIKE $${index + 2})`);
    values.push(pattern, pattern, pattern);
    index += 3;
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return many(`
    SELECT o.*, m.titre AS menu_titre
    FROM orders o
    JOIN menus m ON m.id = o.menu_id
    ${whereClause}
    ORDER BY o.id DESC
  `, values, client);
}

async function updateOrder(orderId, updates, client = null) {
  const fields = [];
  const values = [];
  let index = 1;
  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = $${index++}`);
    values.push(value);
  });
  values.push(orderId);
  await query(`UPDATE orders SET ${fields.join(", ")} WHERE id = $${index}`, values, client);
}

async function findOrderIdsByMenu(menuId, client = null) {
  const rows = await many("SELECT id FROM orders WHERE menu_id = $1", [menuId], client);
  return rows.map((row) => row.id);
}

async function deleteOrdersByMenu(menuId, client = null) {
  await query("DELETE FROM orders WHERE menu_id = $1", [menuId], client);
}

async function deleteHistoryByOrderIds(orderIds, client = null) {
  if (!orderIds.length) return;
  await query("DELETE FROM order_history WHERE order_id = ANY($1::int[])", [orderIds], client);
}

module.exports = {
  createOrder,
  addHistory,
  findById,
  findHistory,
  findMany,
  updateOrder,
  findOrderIdsByMenu,
  deleteOrdersByMenu,
  deleteHistoryByOrderIds
};
