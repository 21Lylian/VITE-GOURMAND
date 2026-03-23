const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const adminService = require("../services/adminService");

const router = express.Router();

router.post("/employees", requireAuth, requireRole("admin"), async (req, res) => {
  const result = await adminService.createEmployee(req.body);
  return res.status(result.status).json(result.body);
});

router.patch("/employees/:id/disable", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const result = await adminService.setEmployeeDisabled(id, req.body?.disabled);
  return res.status(result.status).json(result.body);
});

router.get("/employees", requireAuth, requireRole("admin"), async (_req, res) => {
  const result = await adminService.listEmployees();
  return res.status(result.status).json(result.body);
});

module.exports = router;
