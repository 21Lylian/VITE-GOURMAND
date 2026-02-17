const fs = require("fs");
const path = require("path");
const { NOSQL_PATH } = require("../config");

const dataDir = path.dirname(NOSQL_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function ensureStore() {
  if (!fs.existsSync(NOSQL_PATH)) {
    fs.writeFileSync(NOSQL_PATH, JSON.stringify({ orders: [] }, null, 2), "utf8");
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(NOSQL_PATH, "utf8");
  const parsed = JSON.parse(raw || '{"orders":[]}');
  const forbiddenTitles = new Set(["Menu Test API", "Menu Paques"]);
  const orders = Array.isArray(parsed.orders) ? parsed.orders : [];
  const cleaned = orders.filter((o) => !forbiddenTitles.has(String(o.menuTitre || "")));

  if (cleaned.length !== orders.length) {
    const next = { orders: cleaned };
    writeStore(next);
    return next;
  }
  return { orders };
}

function writeStore(store) {
  fs.writeFileSync(NOSQL_PATH, JSON.stringify(store, null, 2), "utf8");
}

function upsertOrderDoc(order) {
  const store = readStore();
  const idx = store.orders.findIndex((o) => o.orderId === order.id);
  const doc = {
    orderId: order.id,
    menuId: order.menu_id,
    menuTitre: order.menu_titre,
    total: order.total,
    status: order.statut,
    createdAt: order.created_at
  };
  if (idx >= 0) store.orders[idx] = doc;
  else store.orders.push(doc);
  writeStore(store);
}

function getOrderStats({ menuId, dateFrom, dateTo }) {
  const store = readStore();
  const filtered = store.orders.filter((o) => {
    if (menuId && o.menuId !== menuId) return false;
    if (dateFrom && o.createdAt.slice(0, 10) < dateFrom) return false;
    if (dateTo && o.createdAt.slice(0, 10) > dateTo) return false;
    return true;
  });

  const byMenu = {};
  filtered.forEach((o) => {
    if (!byMenu[o.menuId]) {
      byMenu[o.menuId] = { menuId: o.menuId, menuTitre: o.menuTitre, nbCommandes: 0, chiffreAffaires: 0 };
    }
    byMenu[o.menuId].nbCommandes += 1;
    byMenu[o.menuId].chiffreAffaires += Number(o.total || 0);
  });

  return Object.values(byMenu);
}

module.exports = {
  upsertOrderDoc,
  getOrderStats
};
