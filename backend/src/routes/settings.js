// Role du fichier : routes des horaires et parametres publics.
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const settingsRepository = require("../repositories/settingsRepository");

const router = express.Router();

// Role : route GET /hours.
router.get("/hours", async (_req, res) => {
  const hours = await settingsRepository.getBusinessHours();
  return res.json(hours);
});

// Role : route PUT /hours.
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

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = router;
