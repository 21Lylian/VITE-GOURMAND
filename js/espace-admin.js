function validatePassword(p) {
  return /(?=.{10,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(p || "");
}

async function notify(message) {
  await showModalConfirm(message);
}

document.addEventListener("DOMContentLoaded", async function () {
  const currentUser = window.Api.getUser();
  if (!currentUser || currentUser.role !== "admin") {
    const main = document.querySelector("main");
    if (main) main.innerHTML = "<p>Accès réservé à l'administrateur.</p>";
    return;
  }

  const employesList = document.getElementById("employes-list");
  const form = document.getElementById("form-ajout-employe");
  const filtreMenu = document.getElementById("filtre-menu");
  const canvas = document.getElementById("graph-commandes");
  const ctx = canvas.getContext("2d");
  const caDiv = document.getElementById("chiffre-affaires");

  async function refreshAdminKpis(stats) {
    const employes = await window.Api.adminEmployees();
    const menus = await window.Api.menus();
    const caTotal = (stats || []).reduce((sum, s) => sum + Number(s.chiffreAffaires || 0), 0);

    const kpiEmployesTotal = document.getElementById("kpi-employes-total");
    const kpiEmployesActifs = document.getElementById("kpi-employes-actifs");
    const kpiMenusTotal = document.getElementById("kpi-menus-total");
    const kpiCaTotal = document.getElementById("kpi-ca-total");

    if (kpiEmployesTotal) kpiEmployesTotal.textContent = String(employes.length);
    if (kpiEmployesActifs) kpiEmployesActifs.textContent = String(employes.filter((e) => !e.disabled).length);
    if (kpiMenusTotal) kpiMenusTotal.textContent = String(menus.length);
    if (kpiCaTotal) kpiCaTotal.textContent = `${caTotal.toFixed(2)} EUR`;
  }

  async function afficherEmployes() {
    const employes = await window.Api.adminEmployees();
    if (employes.length === 0) {
      employesList.innerHTML = "<div class=\"admin-empty\">Aucun employé enregistré.</div>";
      return;
    }
    employesList.innerHTML = "";
    employes.forEach((e) => {
      const line = document.createElement("article");
      line.className = "admin-item";
      line.innerHTML = `
        <div class="admin-item-head">
          <strong>${e.email}</strong>
          <span class="${e.disabled ? "admin-status-inactive" : "admin-status-active"}">
            ${e.disabled ? "Inactif" : "Actif"}
          </span>
        </div>
      `;
      const btn = document.createElement("button");
      btn.textContent = e.disabled ? "Activer" : "Désactiver";
      btn.addEventListener("click", async function () {
        await window.Api.adminToggleEmployee(e.id, !e.disabled);
        await afficherEmployes();
        await appliquerStats();
      });
      line.appendChild(btn);
      employesList.appendChild(line);
    });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email-employe").value.trim().toLowerCase();
    const password = document.getElementById("mdp-employe").value;
    if (email.includes("admin")) {
      await notify("Création de compte administrateur interdite depuis cette interface.");
      return;
    }
    if (!validatePassword(password)) {
      await notify("Mot de passe invalide (10 caractères minimum, majuscule, minuscule, chiffre, caractère spécial).");
      return;
    }
    try {
      await window.Api.adminCreateEmployee({ email, password });
      form.reset();
      await afficherEmployes();
      await appliquerStats();
    } catch (err) {
      await notify(err.message || "Erreur création employé.");
    }
  });

  const menus = await window.Api.menus();
  filtreMenu.innerHTML = `<option value="">Tous les menus</option>${menus.map((m) => `<option value="${m.id}">${m.titre}</option>`).join("")}`;

  function drawBars(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (data.length === 0) {
      ctx.fillStyle = "#333";
      ctx.fillText("Aucune commande sur cette période.", 20, 30);
      return;
    }
    const max = Math.max(...data.map((d) => d.nbCommandes));
    const chartBottom = canvas.height - 30;
    const barWidth = Math.max(30, Math.floor((canvas.width - 50) / data.length) - 20);
    data.forEach((d, i) => {
      const x = 30 + i * (barWidth + 20);
      const h = max > 0 ? Math.round((d.nbCommandes / max) * (canvas.height - 70)) : 0;
      const y = chartBottom - h;
      ctx.fillStyle = "#005fcc";
      ctx.fillRect(x, y, barWidth, h);
      ctx.fillStyle = "#111";
      const label = d.menuTitre || `Menu ${d.menuId}`;
      const shortLabel = label.length > 14 ? `${label.slice(0, 14)}...` : label;
      ctx.fillText(shortLabel, x, chartBottom + 15);
      ctx.fillText(`${d.nbCommandes} cmd`, x, y - 6);
    });
  }

  async function appliquerStats() {
    const menuId = filtreMenu.value || undefined;
    const dateFrom = document.getElementById("date-debut").value || undefined;
    const dateTo = document.getElementById("date-fin").value || undefined;
    const stats = await window.Api.statsOrdersByMenu({ menuId, dateFrom, dateTo });
    drawBars(stats);
    caDiv.innerHTML = stats.length === 0
      ? "<div class=\"admin-empty\">Aucun chiffre d'affaires sur ce filtre.</div>"
      : stats.map((s) => `
        <article class="admin-item">
          <div class="admin-item-head">
            <strong>${s.menuTitre || `Menu ${s.menuId}`}</strong>
            <span>${s.nbCommandes} commandes</span>
          </div>
          <div class="admin-meta">CA: <strong>${Number(s.chiffreAffaires).toFixed(2)} EUR</strong></div>
        </article>
      `).join("");
    await refreshAdminKpis(stats);
  }

  document.getElementById("filtres-stats").addEventListener("submit", async function (e) {
    e.preventDefault();
    await appliquerStats();
  });

  await afficherEmployes();
  await appliquerStats();
});
