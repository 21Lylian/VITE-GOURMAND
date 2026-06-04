// Role du fichier : routes admin pour gerer les employes.
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const adminService = require("../services/adminService");

const router = express.Router();

// Role : route POST /employees.
router.post("/employees", requireAuth, requireRole("admin"), async (req, res) => {
  const result = await adminService.createEmployee(req.body);
  return res.status(result.status).json(result.body);
});

// Role : route PATCH /employees/:id/disable.
router.patch("/employees/:id/disable", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const result = await adminService.setEmployeeDisabled(id, req.body?.disabled);
  return res.status(result.status).json(result.body);
});

// Role : route GET /employees.
router.get("/employees", requireAuth, requireRole("admin"), async (_req, res) => {
  const result = await adminService.listEmployees();
  return res.status(result.status).json(result.body);
});

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = router;
