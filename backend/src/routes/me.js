const express = require("express");
const { requireAuth } = require("../middleware/auth");
const userRepository = require("../repositories/userRepository");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  if (!user || user.disabled) return res.status(404).json({ error: "Utilisateur introuvable." });
  return res.json(user);
});

router.put("/", requireAuth, async (req, res) => {
  const { nom, prenom, gsm, adresse } = req.body || {};
  if (nom === undefined && prenom === undefined && gsm === undefined && adresse === undefined) {
    return res.status(400).json({ error: "Aucune modification fournie." });
  }
  const user = await userRepository.updateProfile(req.user.id, {
    nom: nom !== undefined ? String(nom).trim() : undefined,
    prenom: prenom !== undefined ? String(prenom).trim() : undefined,
    gsm: gsm !== undefined ? String(gsm).trim() : undefined,
    adresse: adresse !== undefined ? String(adresse).trim() : undefined
  });
  return res.json(user);
});

module.exports = router;
