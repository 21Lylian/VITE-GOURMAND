const express = require("express");
const { db } = require("../db/sqlite");
const { requireAuth } = require("../middleware/auth");
const { calculateOrderPrice } = require("../utils/pricing");
const { upsertOrderDoc } = require("../db/nosql");
const { isAllowedStaffTransition } = require("../utils/statusRules");

const router = express.Router();

function getMenuById(menuId) {
  return db.prepare(`
    SELECT id, titre, prix, nb_personnes_min, stock
    FROM menus
    WHERE id = ?
  `).get(menuId);
}

function getOrderById(orderId) {
  return db.prepare(`
    SELECT o.*, m.titre as menu_titre
    FROM orders o
    JOIN menus m ON m.id = o.menu_id
    WHERE o.id = ?
  `).get(orderId);
}

function getOrderHistory(orderId) {
  return db.prepare(`
    SELECT status, note, changed_at as at
    FROM order_history
    WHERE order_id = ?
    ORDER BY id ASC
  `).all(orderId);
}

function serializeOrder(order) {
  return {
    id: order.id,
    menuId: order.menu_id,
    menuTitre: order.menu_titre,
    nbPers: order.nb_personnes,
    clientNom: order.client_nom,
    clientPrenom: order.client_prenom,
    clientEmail: order.client_email,
    clientGSM: order.client_gsm,
    adresse: order.adresse,
    ville: order.ville,
    km: order.km,
    date: order.date_prestation,
    heure: order.heure_prestation,
    status: order.statut,
    remise: order.remise,
    frais_livraison: order.frais_livraison,
    total: order.total,
    created_at: order.created_at,
    history: getOrderHistory(order.id)
  };
}

router.post("/", requireAuth, (req, res) => {
  const {
    menuId,
    nbPersonnes,
    clientNom,
    clientPrenom,
    clientEmail,
    clientGSM,
    adresse,
    ville,
    km = 0,
    date,
    heure
  } = req.body || {};

  if (!menuId || !nbPersonnes || !clientNom || !clientPrenom || !clientEmail || !clientGSM || !adresse || !ville || !date || !heure) {
    return res.status(400).json({ error: "Champs commande manquants." });
  }

  const menu = getMenuById(Number(menuId));
  if (!menu) return res.status(404).json({ error: "Menu introuvable." });
  if (Number(nbPersonnes) < menu.nb_personnes_min) {
    return res.status(400).json({ error: `Minimum ${menu.nb_personnes_min} personnes pour ce menu.` });
  }
  if (menu.stock <= 0) return res.status(409).json({ error: "Stock indisponible." });

  const pricing = calculateOrderPrice(menu, Number(nbPersonnes), ville, Number(km));

  try {
    db.exec("BEGIN");
    const insert = db.prepare(`
      INSERT INTO orders (
        user_id, menu_id, nb_personnes, client_nom, client_prenom, client_email, client_gsm,
        adresse, ville, km, date_prestation, heure_prestation, statut, remise, frais_livraison, total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en-attente', ?, ?, ?)
    `);
    const result = insert.run(
      req.user.id,
      Number(menuId),
      Number(nbPersonnes),
      String(clientNom).trim(),
      String(clientPrenom).trim(),
      String(clientEmail).trim().toLowerCase(),
      String(clientGSM).trim(),
      String(adresse).trim(),
      String(ville).trim(),
      Number(km),
      String(date),
      String(heure),
      pricing.discount,
      pricing.deliveryFee,
      pricing.total
    );
    db.prepare("UPDATE menus SET stock = stock - 1 WHERE id = ?").run(Number(menuId));
    db.prepare("INSERT INTO order_history (order_id, status, note) VALUES (?, 'en-attente', 'Commande creee')").run(result.lastInsertRowid);
    db.exec("COMMIT");
    const order = getOrderById(result.lastInsertRowid);
    upsertOrderDoc(order);
    return res.status(201).json(serializeOrder(order));
  } catch (err) {
    try {
      db.exec("ROLLBACK");
    } catch (_ignored) {
      // ignore rollback errors when no transaction is active
    }
    return res.status(500).json({ error: "Erreur lors de la creation de commande.", detail: err.message });
  }
});

router.get("/", requireAuth, (req, res) => {
  const { status, client } = req.query;
  let sql = `
    SELECT o.*, m.titre as menu_titre
    FROM orders o
    JOIN menus m ON m.id = o.menu_id
  `;
  const conditions = [];
  const params = [];

  if (req.user.role === "utilisateur") {
    conditions.push("o.user_id = ?");
    params.push(req.user.id);
  }
  if (status) {
    conditions.push("o.statut = ?");
    params.push(String(status));
  }
  if (client && req.user.role !== "utilisateur") {
    conditions.push("(LOWER(o.client_nom) LIKE ? OR LOWER(o.client_prenom) LIKE ? OR LOWER(o.client_email) LIKE ?)");
    const pattern = `%${String(client).toLowerCase()}%`;
    params.push(pattern, pattern, pattern);
  }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  sql += " ORDER BY o.id DESC";

  const rows = db.prepare(sql).all(...params);
  return res.json(rows.map(serializeOrder));
});

router.put("/:id", requireAuth, (req, res) => {
  const orderId = Number(req.params.id);
  if (!Number.isFinite(orderId)) return res.status(400).json({ error: "ID commande invalide." });
  const order = getOrderById(orderId);
  if (!order) return res.status(404).json({ error: "Commande introuvable." });

  const isOwner = req.user.id === order.user_id;
  const isStaff = req.user.role === "employe" || req.user.role === "admin";
  if (!isOwner && !isStaff) return res.status(403).json({ error: "Acces interdit." });

  const payload = req.body || {};
  const updates = [];
  const values = [];
  let historyStatus = null;
  let historyNote = payload.note || null;

  if (isOwner && !isStaff) {
    if (order.statut !== "en-attente") {
      return res.status(409).json({ error: "Modification impossible: commande deja acceptee ou traitee." });
    }
    if (payload.status && payload.status !== "annule") {
      return res.status(400).json({ error: "Statut invalide pour un utilisateur." });
    }
    if (payload.status === "annule") {
      updates.push("statut = 'annule'");
      historyStatus = "annule";
      historyNote = payload.note || "Annulation client";
      db.prepare("UPDATE menus SET stock = stock + 1 WHERE id = ?").run(order.menu_id);
    } else {
      const menu = getMenuById(order.menu_id);
      const nextNb = payload.nbPersonnes ? Number(payload.nbPersonnes) : order.nb_personnes;
      const nextVille = payload.ville || order.ville;
      const nextKm = payload.km !== undefined ? Number(payload.km) : order.km;
      if (nextNb < menu.nb_personnes_min) {
        return res.status(400).json({ error: `Minimum ${menu.nb_personnes_min} personnes pour ce menu.` });
      }
      const pricing = calculateOrderPrice(menu, nextNb, nextVille, nextKm);

      const map = [
        ["client_nom", payload.clientNom],
        ["client_prenom", payload.clientPrenom],
        ["client_email", payload.clientEmail ? String(payload.clientEmail).toLowerCase() : undefined],
        ["client_gsm", payload.clientGSM],
        ["adresse", payload.adresse],
        ["ville", payload.ville],
        ["date_prestation", payload.date],
        ["heure_prestation", payload.heure]
      ];
      map.forEach(([col, value]) => {
        if (value !== undefined) {
          updates.push(`${col} = ?`);
          values.push(String(value).trim());
        }
      });
      if (payload.km !== undefined) {
        updates.push("km = ?");
        values.push(nextKm);
      }
      if (payload.nbPersonnes !== undefined) {
        updates.push("nb_personnes = ?");
        values.push(nextNb);
      }
      updates.push("remise = ?", "frais_livraison = ?", "total = ?");
      values.push(pricing.discount, pricing.deliveryFee, pricing.total);
      historyStatus = order.statut;
      historyNote = payload.note || "Commande modifiee par le client";
    }
  }

  if (isStaff) {
    if (payload.status) {
      const nextStatus = String(payload.status);
      if (!isAllowedStaffTransition(order.statut, nextStatus)) {
        return res.status(400).json({ error: `Transition invalide: ${order.statut} -> ${nextStatus}` });
      }
      if (!payload.note || !String(payload.note).trim()) {
        return res.status(400).json({ error: "Une note de suivi est requise (contact/motif)." });
      }
      updates.push("statut = ?");
      values.push(nextStatus);
      historyStatus = nextStatus;
      historyNote = String(payload.note).trim();
      if (nextStatus === "annule") {
        db.prepare("UPDATE menus SET stock = stock + 1 WHERE id = ?").run(order.menu_id);
      }
    }
  }

  if (!updates.length) {
    return res.status(400).json({ error: "Aucune modification valide fournie." });
  }

  values.push(orderId);
  db.prepare(`UPDATE orders SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  if (historyStatus) {
    db.prepare("INSERT INTO order_history (order_id, status, note) VALUES (?, ?, ?)").run(orderId, historyStatus, historyNote);
  }

  const updated = getOrderById(orderId);
  upsertOrderDoc(updated);
  return res.json(serializeOrder(updated));
});

module.exports = router;
