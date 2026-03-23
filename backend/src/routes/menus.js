const express = require("express");
const menuService = require("../services/menuService");

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await menuService.listMenus(req.query || {});
  return res.status(result.status).json(result.body);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID menu invalide." });
  const result = await menuService.getMenuById(id);
  return res.status(result.status).json(result.body);
});

module.exports = router;
