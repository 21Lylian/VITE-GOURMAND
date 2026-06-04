// Role du fichier : routes authentification, inscription et mot de passe oublie.
const express = require("express");
const authService = require("../services/authService");

const router = express.Router();

// Role : route POST /register.
router.post("/register", async (req, res) => {
  const result = await authService.register(req.body);
  return res.status(result.status).json(result.body);
});

// Role : route POST /login.
router.post("/login", async (req, res) => {
  const result = await authService.login(req.body);
  return res.status(result.status).json(result.body);
});

// Role : route POST /reset-password/request.
router.post("/reset-password/request", async (req, res) => {
  const result = await authService.requestPasswordReset(req.body);
  return res.status(result.status).json(result.body);
});

// Role : route POST /reset-password/confirm.
router.post("/reset-password/confirm", async (req, res) => {
  const result = await authService.confirmPasswordReset(req.body);
  return res.status(result.status).json(result.body);
});

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = router;
