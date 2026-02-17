const express = require("express");
const { db } = require("../db/sqlite");
const { requireAuth, requireRole } = require("../middleware/auth");
const { isStrongPassword, hashPassword } = require("../utils/password");

const router = express.Router();

router.post("/employees", requireAuth, requireRole("admin"), async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis." });
  const normalizedEmail = String(email).trim().toLowerCase();
  if (normalizedEmail.includes("admin")) {
    return res.status(400).json({ error: "Creation de compte admin interdite." });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ error: "Mot de passe trop faible." });
  }
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (exists) return res.status(409).json({ error: "Compte deja existant." });

  const hash = await hashPassword(password);
  const result = db.prepare(`
    INSERT INTO users (nom, prenom, email, password_hash, role, gsm, adresse, disabled)
    VALUES ('', '', ?, ?, 'employe', '', '', 0)
  `).run(normalizedEmail, hash);
  return res.status(201).json({ id: result.lastInsertRowid, email: normalizedEmail, role: "employe" });
});

router.patch("/employees/:id/disable", requireAuth, requireRole("admin"), (req, res) => {
  const id = Number(req.params.id);
  const { disabled } = req.body || {};
  db.prepare("UPDATE users SET disabled = ? WHERE id = ? AND role = 'employe'").run(disabled ? 1 : 0, id);
  const employee = db.prepare("SELECT id, email, role, disabled FROM users WHERE id = ? AND role = 'employe'").get(id);
  if (!employee) return res.status(404).json({ error: "Employe introuvable." });
  return res.json(employee);
});

router.get("/employees", requireAuth, requireRole("admin"), (_req, res) => {
  const employees = db.prepare(`
    SELECT id, email, role, disabled, created_at
    FROM users
    WHERE role = 'employe'
    ORDER BY id DESC
  `).all();
  return res.json(employees);
});

module.exports = router;

