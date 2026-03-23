const menuRepository = require("../repositories/menuRepository");
const orderRepository = require("../repositories/orderRepository");
const { withTransaction } = require("../db/postgres");
const { calculateOrderPrice } = require("../utils/pricing");
const { isAllowedStaffTransition } = require("../utils/statusRules");

async function serializeOrder(order) {
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
    km: Number(order.km),
    date: order.date_prestation,
    heure: order.heure_prestation,
    status: order.statut,
    remise: Number(order.remise),
    frais_livraison: Number(order.frais_livraison),
    total: Number(order.total),
    created_at: order.created_at,
    history: await orderRepository.findHistory(order.id)
  };
}

async function createOrder(currentUser, payload) {
  const { menuId, nbPersonnes, clientNom, clientPrenom, clientEmail, clientGSM, adresse, ville, km = 0, date, heure } = payload || {};
  if (!menuId || !nbPersonnes || !clientNom || !clientPrenom || !clientEmail || !clientGSM || !adresse || !ville || !date || !heure) {
    return { status: 400, body: { error: "Champs commande manquants." } };
  }

  const menu = await menuRepository.findMenuForOrder(Number(menuId));
  if (!menu) return { status: 404, body: { error: "Menu introuvable." } };
  if (Number(nbPersonnes) < menu.nb_personnes_min) {
    return { status: 400, body: { error: `Minimum ${menu.nb_personnes_min} personnes pour ce menu.` } };
  }
  if (menu.stock <= 0) return { status: 409, body: { error: "Stock indisponible." } };

  const pricing = calculateOrderPrice(menu, Number(nbPersonnes), ville, Number(km));

  const orderId = await withTransaction(async (client) => {
    const createdOrderId = await orderRepository.createOrder({
      userId: currentUser.id,
      menuId: Number(menuId),
      nbPersonnes: Number(nbPersonnes),
      clientNom: String(clientNom).trim(),
      clientPrenom: String(clientPrenom).trim(),
      clientEmail: String(clientEmail).trim().toLowerCase(),
      clientGSM: String(clientGSM).trim(),
      adresse: String(adresse).trim(),
      ville: String(ville).trim(),
      km: Number(km),
      date: String(date),
      heure: String(heure),
      remise: pricing.discount,
      fraisLivraison: pricing.deliveryFee,
      total: pricing.total
    }, client);
    await menuRepository.decreaseStock(Number(menuId), 1, client);
    await orderRepository.addHistory(createdOrderId, "en-attente", "Commande creee", client);
    return createdOrderId;
  });

  const order = await orderRepository.findById(orderId);
  return { status: 201, body: await serializeOrder(order) };
}

async function listOrders(currentUser, filters) {
  const rows = await orderRepository.findMany({
    user: currentUser,
    status: filters.status,
    clientSearch: filters.client
  });
  const serialized = [];
  for (const row of rows) {
    serialized.push(await serializeOrder(row));
  }
  return { status: 200, body: serialized };
}

async function updateOrder(currentUser, orderId, payload) {
  const order = await orderRepository.findById(orderId);
  if (!order) return { status: 404, body: { error: "Commande introuvable." } };

  const isOwner = currentUser.id === order.user_id;
  const isStaff = currentUser.role === "employe" || currentUser.role === "admin";
  if (!isOwner && !isStaff) return { status: 403, body: { error: "Acces interdit." } };

  const updates = {};
  let historyStatus = null;
  let historyNote = payload.note || null;

  if (isOwner && !isStaff) {
    if (order.statut !== "en-attente") {
      return { status: 409, body: { error: "Modification impossible: commande deja acceptee ou traitee." } };
    }
    if (payload.status && payload.status !== "annule") {
      return { status: 400, body: { error: "Statut invalide pour un utilisateur." } };
    }
    if (payload.status === "annule") {
      await withTransaction(async (client) => {
        await menuRepository.increaseStock(order.menu_id, 1, client);
        await orderRepository.updateOrder(orderId, { statut: "annule" }, client);
        await orderRepository.addHistory(orderId, "annule", payload.note || "Annulation client", client);
      });
      const canceled = await orderRepository.findById(orderId);
      return { status: 200, body: await serializeOrder(canceled) };
    }

    const menu = await menuRepository.findMenuForOrder(order.menu_id);
    const nextNb = payload.nbPersonnes !== undefined ? Number(payload.nbPersonnes) : order.nb_personnes;
    const nextVille = payload.ville || order.ville;
    const nextKm = payload.km !== undefined ? Number(payload.km) : Number(order.km);
    if (nextNb < menu.nb_personnes_min) {
      return { status: 400, body: { error: `Minimum ${menu.nb_personnes_min} personnes pour ce menu.` } };
    }
    const pricing = calculateOrderPrice(menu, nextNb, nextVille, nextKm);
    const map = {
      client_nom: payload.clientNom,
      client_prenom: payload.clientPrenom,
      client_email: payload.clientEmail ? String(payload.clientEmail).toLowerCase() : undefined,
      client_gsm: payload.clientGSM,
      adresse: payload.adresse,
      ville: payload.ville,
      date_prestation: payload.date,
      heure_prestation: payload.heure
    };
    Object.entries(map).forEach(([key, value]) => {
      if (value !== undefined) updates[key] = String(value).trim();
    });
    if (payload.km !== undefined) updates.km = nextKm;
    if (payload.nbPersonnes !== undefined) updates.nb_personnes = nextNb;
    updates.remise = pricing.discount;
    updates.frais_livraison = pricing.deliveryFee;
    updates.total = pricing.total;
    historyStatus = order.statut;
    historyNote = payload.note || "Commande modifiee par le client";
  }

  if (isStaff && payload.status) {
    const nextStatus = String(payload.status);
    if (!isAllowedStaffTransition(order.statut, nextStatus)) {
      return { status: 400, body: { error: `Transition invalide: ${order.statut} -> ${nextStatus}` } };
    }
    if (!payload.note || !String(payload.note).trim()) {
      return { status: 400, body: { error: "Une note de suivi est requise (contact/motif)." } };
    }
    if (nextStatus === "annule") {
      await withTransaction(async (client) => {
        await menuRepository.increaseStock(order.menu_id, 1, client);
        await orderRepository.updateOrder(orderId, { statut: nextStatus }, client);
        await orderRepository.addHistory(orderId, nextStatus, String(payload.note).trim(), client);
      });
      const canceled = await orderRepository.findById(orderId);
      return { status: 200, body: await serializeOrder(canceled) };
    }
    updates.statut = nextStatus;
    historyStatus = nextStatus;
    historyNote = String(payload.note).trim();
  }

  if (!Object.keys(updates).length) {
    return { status: 400, body: { error: "Aucune modification valide fournie." } };
  }

  await withTransaction(async (client) => {
    await orderRepository.updateOrder(orderId, updates, client);
    if (historyStatus) {
      await orderRepository.addHistory(orderId, historyStatus, historyNote, client);
    }
  });
  const updated = await orderRepository.findById(orderId);
  return { status: 200, body: await serializeOrder(updated) };
}

module.exports = {
  createOrder,
  listOrders,
  updateOrder,
  serializeOrder
};
