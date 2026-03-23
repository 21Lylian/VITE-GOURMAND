const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const settingsRepository = require("../repositories/settingsRepository");

const router = express.Router();

router.get("/hours", async (_req, res) => {
  const hours = await settingsRepository.getBusinessHours();
  return res.json(hours);
});

router.put("/hours", requireAuth, requireRole("employe", "admin"), async (req, res) => {
  const payload = req.body || {};
  const keys = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  const normalized = {};
  for (const key of keys) {
    if (!payload[key]) {
      return res.status(400).json({ error: `Horaire manquant pour ${key}.` });
    }
    normalized[key] = String(payload[key]).trim();
  }
  return res.json(await settingsRepository.upsertBusinessHours(normalized));
});

module.exports = router;
