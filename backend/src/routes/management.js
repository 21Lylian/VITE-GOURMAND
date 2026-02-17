const express = require("express");
const { db } = require("../db/sqlite");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function normalizeMenuInput(payload) {
  const {
    titre,
    description,
    prix,
    theme,
    regime,
    nbPersonnes,
    conditions,
    stock,
    images = [],
    plats = []
  } = payload || {};
  if (!titre || !description || !prix || !theme || !regime || !nbPersonnes || conditions === undefined || stock === undefined) {
    return { error: "Champs menu obligatoires manquants." };
  }
  if (!Array.isArray(images) || !Array.isArray(plats)) {
    return { error: "images et plats doivent etre des tableaux." };
  }
  return {
    data: {
      titre: String(titre).trim(),
      description: String(description).trim(),
      prix: Number(prix),
      theme: String(theme).trim().toLowerCase(),
      regime: String(regime).trim().toLowerCase(),
      nbPersonnes: Number(nbPersonnes),
      conditions: String(conditions).trim(),
      stock: Number(stock),
      images: images.map((x) => String(x).trim()).filter(Boolean),
      plats: plats.map((p) => ({
        type: String(p.type || "Plat").trim(),
        nom: String(p.nom || "").trim(),
        allergenes: Array.isArray(p.allergenes) ? p.allergenes.map((a) => String(a).trim()).filter(Boolean) : []
      })).filter((p) => p.nom)
    }
  };
}

function replaceMenuDishes(menuId, dishes) {
  db.prepare("DELETE FROM menu_dishes WHERE menu_id = ?").run(menuId);
  const insertDish = db.prepare("INSERT INTO dishes (type, nom, allergenes_json) VALUES (?, ?, ?)");
  const linkDish = db.prepare("INSERT INTO menu_dishes (menu_id, dish_id) VALUES (?, ?)");

  dishes.forEach((dish) => {
    const dishId = insertDish.run(dish.type, dish.nom, JSON.stringify(dish.allergenes)).lastInsertRowid;
    linkDish.run(menuId, dishId);
  });
}

router.post("/menus", requireAuth, requireRole("employe", "admin"), (req, res) => {
  const parsed = normalizeMenuInput(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const m = parsed.data;
  if (m.prix <= 0 || m.nbPersonnes < 1 || m.stock < 0) return res.status(400).json({ error: "Valeurs numeriques invalides." });

  db.exec("BEGIN");
  try {
    const result = db.prepare(`
      INSERT INTO menus (titre, description, prix, theme, regime, nb_personnes_min, conditions_text, stock, images_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(m.titre, m.description, m.prix, m.theme, m.regime, m.nbPersonnes, m.conditions, m.stock, JSON.stringify(m.images));
    replaceMenuDishes(result.lastInsertRowid, m.plats);
    db.exec("COMMIT");
    return res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: "Erreur creation menu.", detail: err.message });
  }
});

router.put("/menus/:id", requireAuth, requireRole("employe", "admin"), (req, res) => {
  const menuId = Number(req.params.id);
  const parsed = normalizeMenuInput(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const m = parsed.data;
  const exists = db.prepare("SELECT id FROM menus WHERE id = ?").get(menuId);
  if (!exists) return res.status(404).json({ error: "Menu introuvable." });

  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE menus
      SET titre = ?, description = ?, prix = ?, theme = ?, regime = ?, nb_personnes_min = ?, conditions_text = ?, stock = ?, images_json = ?
      WHERE id = ?
    `).run(m.titre, m.description, m.prix, m.theme, m.regime, m.nbPersonnes, m.conditions, m.stock, JSON.stringify(m.images), menuId);
    replaceMenuDishes(menuId, m.plats);
    db.exec("COMMIT");
    return res.json({ ok: true });
  } catch (err) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: "Erreur mise a jour menu.", detail: err.message });
  }
});

router.delete("/menus/:id", requireAuth, requireRole("employe", "admin"), (req, res) => {
  const menuId = Number(req.params.id);
  const force = String(req.query.force || "") === "1";
  const activeOrder = db.prepare(`
    SELECT id FROM orders
    WHERE menu_id = ? AND statut NOT IN ('annule', 'terminee')
    LIMIT 1
  `).get(menuId);

  const hasAnyOrder = db.prepare(`
    SELECT id FROM orders
    WHERE menu_id = ?
    LIMIT 1
  `).get(menuId);

  if (!force && activeOrder) {
    return res.status(409).json({ error: "Suppression impossible: commandes actives existantes." });
  }

  if (!force && hasAnyOrder) {
    return res.status(409).json({ error: "Suppression impossible: des commandes liees existent." });
  }

  if (force && req.user.role !== "admin") {
    return res.status(403).json({ error: "Suppression forcee reservee a l'administrateur." });
  }

  db.exec("BEGIN");
  try {
    if (force) {
      const orderIds = db.prepare("SELECT id FROM orders WHERE menu_id = ?").all(menuId).map((r) => r.id);
      if (orderIds.length) {
        const placeholders = orderIds.map(() => "?").join(", ");
        db.prepare(`DELETE FROM reviews WHERE order_id IN (${placeholders})`).run(...orderIds);
        db.prepare(`DELETE FROM order_history WHERE order_id IN (${placeholders})`).run(...orderIds);
        db.prepare("DELETE FROM orders WHERE menu_id = ?").run(menuId);
      }
    }

    db.prepare("DELETE FROM menu_dishes WHERE menu_id = ?").run(menuId);
    db.prepare("DELETE FROM menus WHERE id = ?").run(menuId);

    // Remove dishes no longer linked to any menu.
    db.prepare(`
      DELETE FROM dishes
      WHERE id IN (
        SELECT d.id
        FROM dishes d
        LEFT JOIN menu_dishes md ON md.dish_id = d.id
        WHERE md.dish_id IS NULL
      )
    `).run();

    db.exec("COMMIT");
    return res.json({ ok: true, forced: force });
  } catch (err) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: "Erreur suppression menu.", detail: err.message });
  }
});

module.exports = router;
