// Role du fichier : routes des avis clients et de leur moderation.
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const reviewRepository = require("../repositories/reviewRepository");
const orderRepository = require("../repositories/orderRepository");

const router = express.Router();

// Role : fonction serializeReview pour isoler une action reutilisable.
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

// Role : route POST /.
router.post("/", requireAuth, requireRole("utilisateur"), async (req, res) => {
  const { orderId, note, commentaire = "" } = req.body || {};
  if (!orderId || !note) return res.status(400).json({ error: "orderId et note requis." });
  const order = await orderRepository.findById(Number(orderId));
  if (!order || order.user_id !== req.user.id) {
    return res.status(404).json({ error: "Commande introuvable." });
  }
  if (order.statut !== "terminee") {
    return res.status(409).json({ error: "Avis disponible uniquement pour une commande terminee." });
  }
  const exists = await reviewRepository.findByOrderId(order.id);
  if (exists) return res.status(409).json({ error: "Avis deja depose pour cette commande." });
  const n = Number(note);
  if (!Number.isFinite(n) || n < 1 || n > 5) return res.status(400).json({ error: "Note invalide." });

  const result = await reviewRepository.createReview({
    orderId: order.id,
    userId: req.user.id,
    note: n,
    commentaire: String(commentaire).trim()
  });
  const review = await reviewRepository.findDetailedById(result.id);
  return res.status(201).json(serializeReview(review));
});

// Role : route GET /me.
router.get("/me", requireAuth, requireRole("utilisateur"), async (req, res) => {
  const rows = await reviewRepository.findForUser(req.user.id);
  return res.json(rows.map(serializeReview));
});

// Role : route GET /pending.
router.get("/pending", requireAuth, requireRole("employe", "admin"), async (_req, res) => {
  const rows = await reviewRepository.findPending();
  return res.json(rows.map(serializeReview));
});

// Role : route PATCH /:id.
router.patch("/:id", requireAuth, requireRole("employe", "admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { action } = req.body || {};
  const row = await reviewRepository.findDetailedById(id);
  if (!row) return res.status(404).json({ error: "Avis introuvable." });
  if (action === "validate") {
    await reviewRepository.validateReview(id);
  } else if (action === "reject") {
    await reviewRepository.deleteReview(id);
  } else {
    return res.status(400).json({ error: "Action invalide (validate/reject)." });
  }
  return res.json({ ok: true });
});

// Role : route GET /validated.
router.get("/validated", async (_req, res) => {
  const rows = await reviewRepository.findValidated();
  return res.json(rows.map(serializeReview));
});

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = router;
