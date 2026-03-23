const { one, many, query } = require("../db/postgres");

async function findByOrderId(orderId, client = null) {
  return one("SELECT id FROM reviews WHERE order_id = $1", [orderId], client);
}

async function createReview(data, client = null) {
  return one(`
    INSERT INTO reviews (order_id, user_id, note, commentaire, valide)
    VALUES ($1, $2, $3, $4, false)
    RETURNING id
  `, [data.orderId, data.userId, data.note, data.commentaire], client);
}

async function findDetailedById(id, client = null) {
  return one(`
    SELECT r.*, o.client_email, m.titre AS menu_titre
    FROM reviews r
    JOIN orders o ON o.id = r.order_id
    JOIN menus m ON m.id = o.menu_id
    WHERE r.id = $1
  `, [id], client);
}

async function findForUser(userId, client = null) {
  return many(`
    SELECT r.*, o.client_email, m.titre AS menu_titre
    FROM reviews r
    JOIN orders o ON o.id = r.order_id
    JOIN menus m ON m.id = o.menu_id
    WHERE r.user_id = $1
    ORDER BY r.id DESC
  `, [userId], client);
}

async function findPending(client = null) {
  return many(`
    SELECT r.*, o.client_email, m.titre AS menu_titre
    FROM reviews r
    JOIN orders o ON o.id = r.order_id
    JOIN menus m ON m.id = o.menu_id
    WHERE r.valide = false
    ORDER BY r.id DESC
  `, [], client);
}

async function findValidated(client = null) {
  return many(`
    SELECT r.*, o.client_email, m.titre AS menu_titre
    FROM reviews r
    JOIN orders o ON o.id = r.order_id
    JOIN menus m ON m.id = o.menu_id
    WHERE r.valide = true
    ORDER BY r.id DESC
    LIMIT 20
  `, [], client);
}

async function validateReview(id, client = null) {
  await query("UPDATE reviews SET valide = true WHERE id = $1", [id], client);
}

async function deleteReview(id, client = null) {
  await query("DELETE FROM reviews WHERE id = $1", [id], client);
}

async function deleteByOrderIds(orderIds, client = null) {
  if (!orderIds.length) return;
  await query("DELETE FROM reviews WHERE order_id = ANY($1::int[])", [orderIds], client);
}

module.exports = {
  findByOrderId,
  createReview,
  findDetailedById,
  findForUser,
  findPending,
  findValidated,
  validateReview,
  deleteReview,
  deleteByOrderIds
};
