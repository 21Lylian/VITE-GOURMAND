const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const menuService = require("../services/menuService");

const router = express.Router();

router.post("/menus", requireAuth, requireRole("employe", "admin"), async (req, res) => {
  const result = await menuService.createMenu(req.body);
  return res.status(result.status).json(result.body);
});

router.put("/menus/:id", requireAuth, requireRole("employe", "admin"), async (req, res) => {
  const menuId = Number(req.params.id);
  const result = await menuService.updateMenu(menuId, req.body);
  return res.status(result.status).json(result.body);
});

router.delete("/menus/:id", requireAuth, requireRole("employe", "admin"), async (req, res) => {
  const menuId = Number(req.params.id);
  const force = String(req.query.force || "") === "1";
  const result = await menuService.deleteMenu(menuId, force, req.user);
  return res.status(result.status).json(result.body);
});

module.exports = router;
