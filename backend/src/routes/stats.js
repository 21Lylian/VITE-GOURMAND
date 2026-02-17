const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getOrderStats } = require("../db/nosql");

const router = express.Router();

router.get("/orders-by-menu", requireAuth, requireRole("admin"), (req, res) => {
  const { menuId, dateFrom, dateTo } = req.query;
  const stats = getOrderStats({
    menuId: menuId ? Number(menuId) : null,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null
  });
  return res.json(stats);
});

module.exports = router;

