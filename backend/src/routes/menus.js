const express = require("express");
const { db } = require("../db/sqlite");

const router = express.Router();

function parseMenu(row) {
  return {
    id: row.id,
    titre: row.titre,
    description: row.description,
    prix: row.prix,
    theme: row.theme,
    regime: row.regime,
    nbPersonnes: row.nb_personnes_min,
    conditions: row.conditions_text,
    stock: row.stock,
    images: JSON.parse(row.images_json || "[]")
  };
}

router.get("/", (req, res) => {
  const { prixMin, prixMax, theme, regime, nbPersonnes } = req.query;
  let sql = `
    SELECT id, titre, description, prix, theme, regime, nb_personnes_min, conditions_text, stock, images_json
    FROM menus
  `;
  const where = [];
  const params = [];
  if (prixMin !== undefined) {
    where.push("prix >= ?");
    params.push(Number(prixMin));
  }
  if (prixMax !== undefined) {
    where.push("prix <= ?");
    params.push(Number(prixMax));
  }
  if (theme) {
    where.push("theme = ?");
    params.push(String(theme).toLowerCase());
  }
  if (regime) {
    where.push("regime = ?");
    params.push(String(regime).toLowerCase());
  }
  if (nbPersonnes !== undefined) {
    where.push("nb_personnes_min >= ?");
    params.push(Number(nbPersonnes));
  }
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += " ORDER BY id ASC";
  const rows = db.prepare(sql).all(...params);
  return res.json(rows.map(parseMenu));
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID menu invalide." });
  const row = db.prepare(`
    SELECT id, titre, description, prix, theme, regime, nb_personnes_min, conditions_text, stock, images_json
    FROM menus
    WHERE id = ?
  `).get(id);
  if (!row) return res.status(404).json({ error: "Menu introuvable." });

  const dishes = db.prepare(`
    SELECT d.id, d.type, d.nom, d.allergenes_json
    FROM dishes d
    JOIN menu_dishes md ON md.dish_id = d.id
    WHERE md.menu_id = ?
    ORDER BY d.id ASC
  `).all(id).map((d) => ({
    id: d.id,
    type: d.type,
    nom: d.nom,
    allergenes: JSON.parse(d.allergenes_json || "[]")
  }));

  return res.json({ ...parseMenu(row), plats: dishes });
});

module.exports = router;
