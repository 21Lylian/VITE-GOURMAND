const express = require("express");
const authService = require("../services/authService");

const router = express.Router();

router.post("/register", async (req, res) => {
  const result = await authService.register(req.body);
  return res.status(result.status).json(result.body);
});

router.post("/login", async (req, res) => {
  const result = await authService.login(req.body);
  return res.status(result.status).json(result.body);
});

router.post("/reset-password/request", async (req, res) => {
  const result = await authService.requestPasswordReset(req.body);
  return res.status(result.status).json(result.body);
});

router.post("/reset-password/confirm", async (req, res) => {
  const result = await authService.confirmPasswordReset(req.body);
  return res.status(result.status).json(result.body);
});

module.exports = router;
