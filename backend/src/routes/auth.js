const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { db } = require("../db/sqlite");
const { JWT_SECRET } = require("../config");
const { isStrongPassword, hashPassword, verifyPassword } = require("../utils/password");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { nom, prenom, email, password, gsm = "", adresse = "" } = req.body || {};
  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ error: "Mot de passe trop faible." });
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(String(email).toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Un compte existe deja avec cet email." });
  }

  const passwordHash = await hashPassword(password);
  const result = db.prepare(`
    INSERT INTO users (nom, prenom, email, password_hash, role, gsm, adresse, disabled)
    VALUES (?, ?, ?, ?, 'utilisateur', ?, ?, 0)
  `).run(nom.trim(), prenom.trim(), String(email).toLowerCase(), passwordHash, gsm.trim(), adresse.trim());

  const user = db.prepare("SELECT id, nom, prenom, email, role, gsm, adresse FROM users WHERE id = ?").get(result.lastInsertRowid);
  return res.status(201).json({ user, message: "Inscription reussie." });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }
  const user = db.prepare(`
    SELECT id, nom, prenom, email, role, gsm, adresse, password_hash, disabled
    FROM users WHERE email = ?
  `).get(String(email).toLowerCase());
  if (!user || user.disabled) {
    return res.status(401).json({ error: "Identifiants invalides." });
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Identifiants invalides." });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, nom: user.nom, prenom: user.prenom },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
  return res.json({
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      gsm: user.gsm,
      adresse: user.adresse
    }
  });
});

router.post("/reset-password/request", (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email requis." });
  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(String(email).toLowerCase());
  if (user) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + (1000 * 60 * 30)).toISOString();
    db.prepare(`
      INSERT INTO password_resets (user_id, token, expires_at, used)
      VALUES (?, ?, ?, 0)
    `).run(user.id, token, expiresAt);
    // En production, ce token est envoye par email.
    return res.json({ ok: true, resetToken: token, expiresAt });
  }
  // Reponse identique pour eviter l'enumeration d'emails.
  return res.json({ ok: true });
});

router.post("/reset-password/confirm", async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: "Token et mot de passe requis." });
  if (!isStrongPassword(password)) return res.status(400).json({ error: "Mot de passe trop faible." });
  const reset = db.prepare(`
    SELECT id, user_id, expires_at, used
    FROM password_resets
    WHERE token = ?
  `).get(String(token));
  if (!reset || reset.used) return res.status(400).json({ error: "Token invalide." });
  if (new Date(reset.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: "Token expire." });
  }
  const passwordHash = await hashPassword(password);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, reset.user_id);
  db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(reset.id);
  return res.json({ ok: true, message: "Mot de passe mis a jour." });
});

module.exports = router;
