const express = require("express");
const { requireAuth } = require("../middleware/auth");
const orderService = require("../services/orderService");
const { upsertOrderDoc } = require("../db/nosql");

const router = express.Router();
router.post("/", requireAuth, async (req, res) => {
  const result = await orderService.createOrder(req.user, req.body);
  if (result.status === 201) {
    upsertOrderDoc(result.body);
  }
  return res.status(result.status).json(result.body);
});

router.get("/", requireAuth, async (req, res) => {
  const result = await orderService.listOrders(req.user, req.query || {});
  return res.status(result.status).json(result.body);
});

router.put("/:id", requireAuth, async (req, res) => {
  const orderId = Number(req.params.id);
  if (!Number.isFinite(orderId)) return res.status(400).json({ error: "ID commande invalide." });
  const result = await orderService.updateOrder(req.user, orderId, req.body || {});
  if (result.status === 200) {
    upsertOrderDoc(result.body);
  }
  return res.status(result.status).json(result.body);
});

module.exports = router;
