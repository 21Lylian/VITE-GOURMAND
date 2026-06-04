// Role du fichier : routes statistiques reservees a l admin.
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getOrderStats } = require("../db/nosql");

const router = express.Router();

// Role : route GET /orders-by-menu.
router.get("/orders-by-menu", requireAuth, requireRole("admin"), (req, res) => {
  const { menuId, dateFrom, dateTo } = req.query;
  const stats = getOrderStats({
    menuId: menuId ? Number(menuId) : null,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null
  });
  return res.json(stats);
});

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = router;

