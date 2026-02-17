const express = require("express");
const { db } = require("../db/sqlite");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const user = db.prepare(`
    SELECT id, nom, prenom, email, role, gsm, adresse, disabled, created_at
    FROM users
    WHERE id = ?
  `).get(req.user.id);
  if (!user || user.disabled) return res.status(404).json({ error: "Utilisateur introuvable." });
  return res.json(user);
});

router.put("/", requireAuth, (req, res) => {
  const { nom, prenom, gsm, adresse } = req.body || {};
  const updates = [];
  const values = [];

  if (nom !== undefined) {
    updates.push("nom = ?");
    values.push(String(nom).trim());
  }
  if (prenom !== undefined) {
    updates.push("prenom = ?");
    values.push(String(prenom).trim());
  }
  if (gsm !== undefined) {
    updates.push("gsm = ?");
    values.push(String(gsm).trim());
  }
  if (adresse !== undefined) {
    updates.push("adresse = ?");
    values.push(String(adresse).trim());
  }
  if (!updates.length) return res.status(400).json({ error: "Aucune modification fournie." });

  values.push(req.user.id);
  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  const user = db.prepare(`
    SELECT id, nom, prenom, email, role, gsm, adresse, disabled, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);
  return res.json(user);
});

module.exports = router;

