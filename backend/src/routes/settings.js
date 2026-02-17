const express = require("express");
const { db } = require("../db/sqlite");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/hours", (_req, res) => {
  const row = db.prepare("SELECT value_json FROM settings WHERE key = 'business_hours'").get();
  const hours = row ? JSON.parse(row.value_json) : {};
  return res.json(hours);
});

router.put("/hours", requireAuth, requireRole("employe", "admin"), (req, res) => {
  const payload = req.body || {};
  const keys = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  const normalized = {};
  for (const key of keys) {
    if (!payload[key]) {
      return res.status(400).json({ error: `Horaire manquant pour ${key}.` });
    }
    normalized[key] = String(payload[key]).trim();
  }
  db.prepare(`
    INSERT INTO settings (key, value_json) VALUES ('business_hours', ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json
  `).run(JSON.stringify(normalized));

  return res.json(normalized);
});

module.exports = router;

