const { withTransaction } = require("../db/postgres");
const menuRepository = require("../repositories/menuRepository");
const orderRepository = require("../repositories/orderRepository");
const reviewRepository = require("../repositories/reviewRepository");

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

function serializeMenu(row) {
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
    images: row.images_json
  };
}

async function listMenus(filters) {
  const rows = await menuRepository.findAll(filters);
  return { status: 200, body: rows.map(serializeMenu) };
}

async function getMenuById(id) {
  const row = await menuRepository.findById(id);
  if (!row) return { status: 404, body: { error: "Menu introuvable." } };
  const dishes = await menuRepository.findDishesByMenuId(id);
  return { status: 200, body: { ...serializeMenu(row), plats: dishes } };
}

async function createMenu(payload) {
  const parsed = normalizeMenuInput(payload);
  if (parsed.error) return { status: 400, body: { error: parsed.error } };
  const menu = parsed.data;
  if (menu.prix <= 0 || menu.nbPersonnes < 1 || menu.stock < 0) {
    return { status: 400, body: { error: "Valeurs numeriques invalides." } };
  }
  const id = await withTransaction(async (client) => {
    const menuId = await menuRepository.createMenu(menu, client);
    await menuRepository.replaceMenuDishes(menuId, menu.plats, client);
    return menuId;
  });
  return { status: 201, body: { id } };
}

async function updateMenu(menuId, payload) {
  const parsed = normalizeMenuInput(payload);
  if (parsed.error) return { status: 400, body: { error: parsed.error } };
  const exists = await menuRepository.findById(menuId);
  if (!exists) return { status: 404, body: { error: "Menu introuvable." } };
  const menu = parsed.data;
  await withTransaction(async (client) => {
    await menuRepository.updateMenu(menuId, menu, client);
    await menuRepository.replaceMenuDishes(menuId, menu.plats, client);
  });
  return { status: 200, body: { ok: true } };
}

async function deleteMenu(menuId, force, currentUser) {
  const activeOrdersCount = await menuRepository.countOrdersByMenu(menuId, true);
  const allOrdersCount = await menuRepository.countOrdersByMenu(menuId, false);

  if (!force && activeOrdersCount > 0) {
    return { status: 409, body: { error: "Suppression impossible: commandes actives existantes." } };
  }
  if (!force && allOrdersCount > 0) {
    return { status: 409, body: { error: "Suppression impossible: des commandes liees existent." } };
  }
  if (force && currentUser.role !== "admin") {
    return { status: 403, body: { error: "Suppression forcee reservee a l'administrateur." } };
  }

  await withTransaction(async (client) => {
    if (force) {
      const orderIds = await orderRepository.findOrderIdsByMenu(menuId, client);
      await reviewRepository.deleteByOrderIds(orderIds, client);
      await orderRepository.deleteHistoryByOrderIds(orderIds, client);
      await orderRepository.deleteOrdersByMenu(menuId, client);
    }
    await menuRepository.deleteMenu(menuId, client);
  });

  return { status: 200, body: { ok: true, forced: force } };
}

module.exports = {
  listMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
};
