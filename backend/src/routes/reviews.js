const express = require("express");
const { db } = require("../db/sqlite");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function serializeReview(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    note: row.note,
    commentaire: row.commentaire,
    valide: !!row.valide,
    createdAt: row.created_at,
    clientEmail: row.client_email,
    menuTitre: row.menu_titre
  };
}

router.post("/", requireAuth, requireRole("utilisateur"), (req, res) => {
  const { orderId, note, commentaire = "" } = req.body || {};
  if (!orderId || !note) return res.status(400).json({ error: "orderId et note requis." });
  const order = db.prepare(`
    SELECT id, user_id, statut
    FROM orders
    WHERE id = ?
  `).get(Number(orderId));
  if (!order || order.user_id !== req.user.id) {
    return res.status(404).json({ error: "Commande introuvable." });
  }
  if (order.statut !== "terminee") {
    return res.status(409).json({ error: "Avis disponible uniquement pour une commande terminee." });
  }
  const exists = db.prepare("SELECT id FROM reviews WHERE order_id = ?").get(order.id);
  if (exists) return res.status(409).json({ error: "Avis deja depose pour cette commande." });
  const n = Number(note);
  if (!Number.isFinite(n) || n < 1 || n > 5) return res.status(400).json({ error: "Note invalide." });

  const result = db.prepare(`
    INSERT INTO reviews (order_id, user_id, note, commentaire, valide)
    VALUES (?, ?, ?, ?, 0)
  `).run(order.id, req.user.id, n, String(commentaire).trim());

  const review = db.prepare(`
    SELECT r.*, o.client_email, m.titre as menu_titre
    FROM reviews r
    JOIN orders o ON o.id = r.order_id
    JOIN menus m ON m.id = o.menu_id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);
  return res.status(201).json(serializeReview(review));
});

router.get("/me", requireAuth, requireRole("utilisateur"), (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, o.client_email, m.titre as menu_titre
    FROM reviews r
    JOIN orders o ON o.id = r.order_id
    JOIN menus m ON m.id = o.menu_id
    WHERE r.user_id = ?
    ORDER BY r.id DESC
  `).all(req.user.id);
  return res.json(rows.map(serializeReview));
});

router.get("/pending", requireAuth, requireRole("employe", "admin"), (_req, res) => {
  const rows = db.prepare(`
    SELECT r.*, o.client_email, m.titre as menu_titre
    FROM reviews r
    JOIN orders o ON o.id = r.order_id
    JOIN menus m ON m.id = o.menu_id
    WHERE r.valide = 0
    ORDER BY r.id DESC
  `).all();
  return res.json(rows.map(serializeReview));
});

router.patch("/:id", requireAuth, requireRole("employe", "admin"), (req, res) => {
  const id = Number(req.params.id);
  const { action } = req.body || {};
  const row = db.prepare("SELECT id FROM reviews WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Avis introuvable." });
  if (action === "validate") {
    db.prepare("UPDATE reviews SET valide = 1 WHERE id = ?").run(id);
  } else if (action === "reject") {
    db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
  } else {
    return res.status(400).json({ error: "Action invalide (validate/reject)." });
  }
  return res.json({ ok: true });
});

router.get("/validated", (_req, res) => {
  const rows = db.prepare(`
    SELECT r.*, o.client_email, m.titre as menu_titre
    FROM reviews r
    JOIN orders o ON o.id = r.order_id
    JOIN menus m ON m.id = o.menu_id
    WHERE r.valide = 1
    ORDER BY r.id DESC
    LIMIT 20
  `).all();
  return res.json(rows.map(serializeReview));
});

module.exports = router;

