// Role du fichier : routes publiques de consultation des menus.
const express = require("express");
const menuService = require("../services/menuService");

const router = express.Router();

// Role : route GET /.
router.get("/", async (req, res) => {
  const result = await menuService.listMenus(req.query || {});
  return res.status(result.status).json(result.body);
});

// Role : route GET /:id.
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID menu invalide." });
  const result = await menuService.getMenuById(id);
  return res.status(result.status).json(result.body);
});

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = router;
