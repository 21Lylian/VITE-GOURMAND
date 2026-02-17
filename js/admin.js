// admin.js - demo admin for charts and order/user management
document.addEventListener("DOMContentLoaded", function () {
  const menus = (window.AppData && typeof window.AppData.getMenus === "function")
    ? window.AppData.getMenus()
    : [];
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const stats = menus.map((m) => ({ id: m.id, titre: m.titre, commandes: 0, ca: 0 }));
  orders.forEach((o) => {
    const stat = stats.find((x) => x.id === o.menuId);
    if (stat) {
      stat.commandes += 1;
      stat.ca += parseFloat(o.total || 0);
    }
  });

  renderKpis(orders, users);
  renderChart(stats);
  renderOrders(orders);
  renderUsers(users);
});

function renderKpis(orders, users) {
  const kpiOrders = document.getElementById("kpi-orders");
  const kpiUsers = document.getElementById("kpi-users");
  const kpiRevenue = document.getElementById("kpi-revenue");
  const revenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  if (kpiOrders) kpiOrders.textContent = String(orders.length);
  if (kpiUsers) kpiUsers.textContent = String(users.length);
  if (kpiRevenue) kpiRevenue.textContent = `${revenue.toFixed(2)} EUR`;
}

function renderChart(stats) {
  const canvas = document.getElementById("chart-ca");
  if (!canvas || typeof Chart === "undefined") return;

  const hasData = stats.length > 0;
  const labels = hasData ? stats.map((s) => s.titre) : ["Aucune donnée"];
  const values = hasData ? stats.map((s) => s.ca) : [0];

  new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Chiffre d'affaires (EUR)",
        data: values,
        backgroundColor: "#d35400"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function renderOrders(orders) {
  const ordersDiv = document.getElementById("admin-orders");
  if (!ordersDiv) return;
  ordersDiv.innerHTML = "";

  if (!orders.length) {
    ordersDiv.innerHTML = "<div class=\"admin-empty\">Aucune commande pour le moment.</div>";
    return;
  }

  orders.forEach((o) => {
    const box = document.createElement("article");
    box.className = "admin-item";
    box.innerHTML = `
      <div class="admin-item-head">
        <strong>${o.menuTitre || "Menu inconnu"}</strong>
        <span class="admin-meta">${o.date || ""} ${o.heure || ""}</span>
      </div>
      <div class="admin-meta">${o.nbPers || 0} pers. | Statut: <span class="status">${o.status || "en-attente"}</span></div>
    `;

    const sel = document.createElement("select");
    [
      "en-attente",
      "accepte",
      "preparation",
      "livraison",
      "livre",
      "retour",
      "terminee",
      "annule"
    ].forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if ((o.status || "en-attente") === s) opt.selected = true;
      sel.appendChild(opt);
    });

    sel.addEventListener("change", async function () {
      o.status = sel.value;
      o.history = o.history || [];
      o.history.push({ status: sel.value, at: new Date().toISOString() });
      localStorage.setItem("orders", JSON.stringify(orders));
      const status = box.querySelector(".status");
      if (status) status.textContent = sel.value;
      if (typeof showModalConfirm === "function") {
        await showModalConfirm("Statut mis à jour (démo).");
      }
    });

    box.appendChild(sel);
    ordersDiv.appendChild(box);
  });
}

function renderUsers(users) {
  const usersDiv = document.getElementById("admin-users");
  if (!usersDiv) return;
  usersDiv.innerHTML = "";

  if (!users.length) {
    usersDiv.innerHTML = "<div class=\"admin-empty\">Aucun utilisateur enregistre.</div>";
    return;
  }

  users.forEach((u) => {
    const line = document.createElement("article");
    line.className = "admin-item";
    line.innerHTML = `
      <div class="admin-item-head">
        <strong>${u.prenom || ""} ${u.nom || ""}</strong>
        <em>${u.role || "utilisateur"}</em>
      </div>
      <div class="admin-meta">${u.email || "Sans email"}</div>
    `;

    const btn = document.createElement("button");
    btn.textContent = u.disabled ? "Compte désactivé" : "Désactiver (démo)";
    btn.disabled = !!u.disabled;

    btn.addEventListener("click", async function () {
      u.disabled = true;
      localStorage.setItem("users", JSON.stringify(users));
      line.classList.add("admin-item-disabled");
      btn.textContent = "Compte désactivé";
      btn.disabled = true;
      if (typeof showModalConfirm === "function") {
        await showModalConfirm("Compte désactivé (démo)");
      }
    });

    if (u.disabled) line.classList.add("admin-item-disabled");
    line.appendChild(btn);
    usersDiv.appendChild(line);
  });
}
