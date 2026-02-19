function getStatutLabel(status) {
  const labels = {
    "en-attente": "En attente",
    accepte: "Accepte",
    preparation: "En préparation",
    livraison: "En cours de livraison",
    livre: "Livre",
    retour: "En attente retour materiel",
    terminee: "Terminée",
    annule: "Annulée"
  };
  return labels[status] || status;
}

const HIDDEN_TEST_CLIENTS = new Set(["test", "2 test", "user test", "user order"]);

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isHiddenTestOrder(order) {
  const fullName = normalizeText(`${order.clientPrenom || ""} ${order.clientNom || ""}`);
  const firstName = normalizeText(order.clientPrenom);
  const lastName = normalizeText(order.clientNom);
  const email = normalizeText(order.clientEmail);

  if (HIDDEN_TEST_CLIENTS.has(fullName)) return true;
  if (firstName === "user" && (lastName === "test" || lastName === "order")) return true;
  if (email.endsWith("@test.local") || email.endsWith("@local.test")) return true;
  if (email.includes(".test.")) return true;
  return false;
}

function parseAllergenes(text) {
  return (text || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

async function saisirPlat(initial) {
  const type = await showModalPrompt("Type de plat (Entree/Plat/Dessert)", initial ? initial.type : "");
  if (type === null) return null;
  const nom = await showModalPrompt("Nom du plat", initial ? initial.nom : "");
  if (nom === null) return null;
  const allergenesRaw = await showModalPrompt(
    "Allergenes (separes par des virgules)",
    initial ? (initial.allergenes || []).join(", ") : ""
  );
  if (allergenesRaw === null) return null;
  return {
    type: type || "Plat",
    nom,
    allergenes: parseAllergenes(allergenesRaw)
  };
}

async function saisirMenu(initial) {
  const titre = await showModalPrompt("Titre du menu", initial ? initial.titre : "");
  if (titre === null) return null;
  const description = await showModalPrompt("Description du menu", initial ? initial.description : "");
  if (description === null) return null;
  const theme = await showModalPrompt("Theme (noel, classique, evenement)", initial ? initial.theme : "classique");
  if (theme === null) return null;
  const regime = await showModalPrompt("Regime (classique, vegetarien, vegan)", initial ? initial.regime : "classique");
  if (regime === null) return null;
  const nbPersonnesRaw = await showModalPrompt("Nombre minimum de personnes", initial ? String(initial.nbPersonnes) : "2");
  if (nbPersonnesRaw === null) return null;
  const prixRaw = await showModalPrompt("Prix de base du menu (EUR)", initial ? String(initial.prix) : "100");
  if (prixRaw === null) return null;
  const stockRaw = await showModalPrompt("Stock disponible", initial ? String(initial.stock || 0) : "0");
  if (stockRaw === null) return null;
  const conditions = await showModalPrompt("Conditions du menu", initial ? initial.conditions : "");
  if (conditions === null) return null;
  const imagesRaw = await showModalPrompt("Images (URLs separees par des virgules)", initial ? (initial.images || []).join(", ") : "");
  if (imagesRaw === null) return null;
  return {
    titre: titre.trim(),
    description: description.trim(),
    theme: theme.trim().toLowerCase(),
    regime: regime.trim().toLowerCase(),
    nbPersonnes: Number(nbPersonnesRaw),
    prix: Number(prixRaw),
    stock: Number(stockRaw),
    conditions: conditions.trim(),
    images: imagesRaw.split(",").map((x) => x.trim()).filter(Boolean)
  };
}

async function refreshKpis() {
  const menus = await window.Api.menus();
  const orders = (await window.Api.listOrders()).filter((o) => !isHiddenTestOrder(o));
  const pendingReviews = await window.Api.pendingReviews();
  const commandesAttente = orders.filter((o) => (o.status || "en-attente") === "en-attente").length;

  const kpiMenus = document.getElementById("kpi-menus");
  const kpiTotal = document.getElementById("kpi-commandes-total");
  const kpiAttente = document.getElementById("kpi-commandes-attente");
  const kpiAvis = document.getElementById("kpi-avis-attente");

  if (kpiMenus) kpiMenus.textContent = String(menus.length);
  if (kpiTotal) kpiTotal.textContent = String(orders.length);
  if (kpiAttente) kpiAttente.textContent = String(commandesAttente);
  if (kpiAvis) kpiAvis.textContent = String(pendingReviews.length);
}

document.addEventListener("DOMContentLoaded", async function () {
  const user = window.Api.getUser();
  if (!user) {
    window.location = "connexion.html?next=espace-employe.html";
    return;
  }
  if (user.role !== "employe" && user.role !== "admin") {
    const main = document.querySelector("main");
    if (main) main.innerHTML = "<p>Accès réservé au personnel.</p>";
    return;
  }

  let menuDetails = [];

  async function loadMenusDetailed() {
    const menus = await window.Api.menus();
    menuDetails = await Promise.all(menus.map((m) => window.Api.menuById(m.id)));
    return menuDetails;
  }

  async function renderMenus() {
    const container = document.getElementById("liste-menus-employe");
    container.innerHTML = "";
    const menus = await loadMenusDetailed();
    if (!menus.length) {
      container.innerHTML = "<div class=\"employe-empty\">Aucun menu configuré.</div>";
      await refreshKpis();
      return;
    }
    menus.forEach((menu) => {
      const bloc = document.createElement("div");
      bloc.className = "menu employe-menu-card";
      bloc.innerHTML = `
        <h3>${menu.titre}</h3>
        <p>${menu.description}</p>
        <p><strong>Theme:</strong> ${menu.theme} | <strong>Regime:</strong> ${menu.regime}</p>
        <p><strong>Min personnes:</strong> ${menu.nbPersonnes} | <strong>Prix:</strong> ${menu.prix} EUR | <strong>Stock:</strong> ${menu.stock || 0}</p>
        <p><strong>Conditions:</strong> ${menu.conditions || "Aucune"}</p>
      `;
      const ul = document.createElement("ul");
      (menu.plats || []).forEach((p) => {
        const li = document.createElement("li");
        li.textContent = `${p.type}: ${p.nom}${p.allergenes && p.allergenes.length ? ` (Allergènes: ${p.allergenes.join(", ")})` : ""}`;
        ul.appendChild(li);
      });
      bloc.appendChild(ul);

      const actions = document.createElement("div");
      actions.className = "employe-actions";

      const btnAddPlat = document.createElement("button");
      btnAddPlat.textContent = "Ajouter plat";
      btnAddPlat.addEventListener("click", async () => {
        const plat = await saisirPlat();
        if (!plat) return;
        const next = Object.assign({}, menu, { plats: [...(menu.plats || []), plat] });
        await window.Api.manageUpdateMenu(menu.id, next);
        await renderMenus();
      });
      actions.appendChild(btnAddPlat);

      const btnEditMenu = document.createElement("button");
      btnEditMenu.textContent = "Modifier menu";
      btnEditMenu.addEventListener("click", async () => {
        const nextData = await saisirMenu(menu);
        if (!nextData) return;
        const next = Object.assign({}, menu, nextData, { plats: menu.plats || [] });
        await window.Api.manageUpdateMenu(menu.id, next);
        await renderMenus();
      });
      actions.appendChild(btnEditMenu);

      const btnDelete = document.createElement("button");
      btnDelete.textContent = "Supprimer menu";
      btnDelete.addEventListener("click", async () => {
        const ok = await showModalConfirm("Supprimer ce menu ?");
        if (!ok) return;
        try {
          await window.Api.manageDeleteMenu(menu.id);
          await renderMenus();
        } catch (err) {
          if (user.role === "admin" && err && err.status === 409) {
            const forceOk = await showModalConfirm(
              "Ce menu a des commandes liees. Suppression forcee (admin) ? Cette action est irreversible."
            );
            if (!forceOk) return;
            try {
              await window.Api.manageDeleteMenu(menu.id, { force: true });
              await renderMenus();
              return;
            } catch (forceErr) {
              await showModalConfirm(forceErr.message || "Suppression forcee impossible.");
              return;
            }
          }
          await showModalConfirm(err.message || "Suppression impossible.");
        }
      });
      actions.appendChild(btnDelete);

      bloc.appendChild(actions);
      container.appendChild(bloc);
    });
    await refreshKpis();
  }

  document.getElementById("ajouter-menu").addEventListener("click", async () => {
    const menuData = await saisirMenu();
    if (!menuData) return;
    await window.Api.manageCreateMenu(Object.assign({}, menuData, { plats: [] }));
    await renderMenus();
  });

  async function renderHoraires() {
    const horaires = await window.Api.getHours();
    document.getElementById("horaire-lundi").value = horaires.lundi || "";
    document.getElementById("horaire-mardi").value = horaires.mardi || "";
    document.getElementById("horaire-mercredi").value = horaires.mercredi || "";
    document.getElementById("horaire-jeudi").value = horaires.jeudi || "";
    document.getElementById("horaire-vendredi").value = horaires.vendredi || "";
    document.getElementById("horaire-samedi").value = horaires.samedi || "";
    document.getElementById("horaire-dimanche").value = horaires.dimanche || "";
  }

  document.getElementById("form-horaires").addEventListener("submit", async function (e) {
    e.preventDefault();
    const payload = {
      lundi: document.getElementById("horaire-lundi").value.trim(),
      mardi: document.getElementById("horaire-mardi").value.trim(),
      mercredi: document.getElementById("horaire-mercredi").value.trim(),
      jeudi: document.getElementById("horaire-jeudi").value.trim(),
      vendredi: document.getElementById("horaire-vendredi").value.trim(),
      samedi: document.getElementById("horaire-samedi").value.trim(),
      dimanche: document.getElementById("horaire-dimanche").value.trim()
    };
    await window.Api.updateHours(payload);
    localStorage.setItem("horaires", JSON.stringify(payload));
    window.dispatchEvent(new Event("horaires-updated"));
    await showModalConfirm("Horaires mis à jour.");
  });

  async function renderCommandes() {
    const tbody = document.getElementById("commandes-employe");
    const status = document.getElementById("statut").value || undefined;
    const client = document.getElementById("client").value.trim() || undefined;
    const orders = (await window.Api.listOrders({ status, client })).filter((o) => !isHiddenTestOrder(o));
    tbody.innerHTML = "";
    if (!orders.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = "<td colspan=\"5\"><div class=\"employe-empty\">Aucune commande trouvée avec ces filtres.</div></td>";
      tbody.appendChild(tr);
      await refreshKpis();
      return;
    }
    orders.forEach((o) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${o.clientPrenom || ""} ${o.clientNom || ""}<br><small>${o.clientEmail || ""}</small></td>
        <td>${o.menuTitre}</td>
        <td>${o.date} ${o.heure || ""}</td>
        <td>${getStatutLabel(o.status || "en-attente")}</td>
      `;
      const tdActions = document.createElement("td");
      const sel = document.createElement("select");
      const current = o.status || "en-attente";
      const allowed = [current].concat(getAllowedTransitions(current, user.role).filter((s) => s !== current));
      allowed.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = getStatutLabel(s);
        if (s === current) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", async () => {
        const nextStatus = sel.value;
        if (nextStatus === current) return;
        const contact = await showModalPrompt("Mode de contact client (mail/appel)", "mail");
        if (contact === null) {
          sel.value = current;
          return;
        }
        let note = `Contact client: ${contact}`;
        if (nextStatus === "annule") {
          const reason = await showModalPrompt("Motif d'annulation", "Motif");
          if (reason === null) {
            sel.value = current;
            return;
          }
          note = `${note} | Motif: ${reason}`;
        }
        try {
          await window.Api.updateOrder(o.id, { status: nextStatus, note });
          await renderCommandes();
        } catch (err) {
          sel.value = current;
          await showModalConfirm(err.message || "Erreur de mise à jour du statut.");
        }
      });
      tdActions.appendChild(sel);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
    await refreshKpis();
  }

  document.getElementById("filtre-commandes").addEventListener("submit", async function (e) {
    e.preventDefault();
    await renderCommandes();
  });
  document.getElementById("client").addEventListener("input", renderCommandes);
  document.getElementById("statut").addEventListener("change", renderCommandes);

  async function renderAvisPending() {
    const ul = document.getElementById("avis-a-valider");
    const reviews = await window.Api.pendingReviews();
    if (!reviews.length) {
      ul.innerHTML = "<li class=\"employe-empty\">Aucun avis en attente.</li>";
      await refreshKpis();
      return;
    }
    ul.innerHTML = "";
    reviews.forEach((a) => {
      const li = document.createElement("li");
      li.className = "employe-avis-item";
      li.innerHTML = `<strong>${a.menuTitre}</strong> - note ${a.note}/5<br>${a.commentaire || "Sans commentaire"}`;
      const actions = document.createElement("div");
      actions.className = "employe-actions";
      const btnV = document.createElement("button");
      btnV.textContent = "Valider";
      btnV.addEventListener("click", async () => {
        await window.Api.validateReview(a.id);
        await renderAvisPending();
      });
      const btnR = document.createElement("button");
      btnR.textContent = "Refuser";
      btnR.addEventListener("click", async () => {
        await window.Api.rejectReview(a.id);
        await renderAvisPending();
      });
      actions.appendChild(btnV);
      actions.appendChild(btnR);
      li.appendChild(actions);
      ul.appendChild(li);
    });
    await refreshKpis();
  }

  try {
    await renderMenus();
    await renderHoraires();
    await renderCommandes();
    await renderAvisPending();
    await refreshKpis();
  } catch (err) {
    const main = document.querySelector("main");
    if (main) main.innerHTML = `<p>Erreur de chargement: ${err.message}</p>`;
  }
});

