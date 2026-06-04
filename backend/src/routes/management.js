// Role du fichier : routes de gestion des menus par le personnel.
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const menuService = require("../services/menuService");

const router = express.Router();

// Role : route POST /menus.
router.post("/menus", requireAuth, requireRole("employe", "admin"), async (req, res) => {
  const result = await menuService.createMenu(req.body);
  return res.status(result.status).json(result.body);
});

// Role : route PUT /menus/:id.
router.put("/menus/:id", requireAuth, requireRole("employe", "admin"), async (req, res) => {
  const menuId = Number(req.params.id);
  const result = await menuService.updateMenu(menuId, req.body);
  return res.status(result.status).json(result.body);
});

// Role : route DELETE /menus/:id.
router.delete("/menus/:id", requireAuth, requireRole("employe", "admin"), async (req, res) => {
  const menuId = Number(req.params.id);
  const force = String(req.query.force || "") === "1";
  const result = await menuService.deleteMenu(menuId, force, req.user);
  return res.status(result.status).json(result.body);
});

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = router;
