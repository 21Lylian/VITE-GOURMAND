function formatOrderHistory(order) {
  return (order.history || [])
    .map((h) => `${h.at} - ${h.status}${h.note ? ` - ${h.note}` : ""}`)
    .join("\n");
}

function setSessionUser(user) {
  const session = window.Api.getSession();
  if (!session) return;
  window.Api.setSession(session.token, {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    role: user.role,
    gsm: user.gsm
  });
}

function renderMesAvis(container, avis) {
  if (!container) return;
  if (!avis.length) {
    container.innerHTML = "<div class=\"espace-empty\">Aucun avis soumis pour le moment.</div>";
    return;
  }
  container.innerHTML = avis.map((a) => {
    const etat = a.valide
      ? "<span class=\"avis-status avis-status-ok\">Valide</span>"
      : "<span class=\"avis-status avis-status-pending\">En attente de validation</span>";
    const etoiles = "★".repeat(a.note) + "☆".repeat(5 - a.note);
    return `
      <div class="avis-item">
        <p><strong>${a.menuTitre}</strong> - ${etoiles} (${a.note}/5)</p>
        <p>${a.commentaire || "Sans commentaire"}</p>
        <p class="avis-meta">Statut: ${etat}</p>
      </div>
    `;
  }).join("");
}

function updateKpis(orders, reviews) {
  const total = orders.length;
  const enAttente = orders.filter((o) => (o.status || "en-attente") === "en-attente").length;
  const terminees = orders.filter((o) => o.status === "terminee").length;

  const elTotal = document.getElementById("kpi-total-commandes");
  const elAttente = document.getElementById("kpi-attente");
  const elTerminees = document.getElementById("kpi-terminees");
  const elAvis = document.getElementById("kpi-avis");

  if (elTotal) elTotal.textContent = String(total);
  if (elAttente) elAttente.textContent = String(enAttente);
  if (elTerminees) elTerminees.textContent = String(terminees);
  if (elAvis) elAvis.textContent = String(reviews.length);
}

document.addEventListener("DOMContentLoaded", async function () {
  const sessionUser = window.Api.getUser();
  if (!sessionUser) {
    window.location = "connexion.html?next=espace-utilisateur.html";
    return;
  }

  const user = await window.Api.me();
  if (user.role !== "utilisateur") {
    const main = document.querySelector("main");
    if (main) main.innerHTML = "<p>Accès réservé aux utilisateurs.</p>";
    return;
  }
  setSessionUser(user);

  document.getElementById("nom").value = user.nom || "";
  document.getElementById("prenom").value = user.prenom || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("gsm").value = user.gsm || "";
  const btnModifierMdp = document.getElementById("btn-modifier-mdp");
  if (btnModifierMdp) {
    btnModifierMdp.addEventListener("click", function () {
      window.location = "reset-password.html";
    });
  }

  const formInfos = document.getElementById("form-infos-utilisateur");
  const majInfos = document.getElementById("maj-infos");
  const avisConfirmation = document.getElementById("avis-confirmation");
  formInfos.addEventListener("submit", async function (e) {
    e.preventDefault();
    const payload = {
      nom: document.getElementById("nom").value.trim(),
      prenom: document.getElementById("prenom").value.trim(),
      gsm: document.getElementById("gsm").value.trim()
    };
    const updated = await window.Api.updateMe(payload);
    setSessionUser(updated);
    if (majInfos) majInfos.hidden = false;
    setTimeout(() => {
      if (majInfos) majInfos.hidden = true;
    }, 2000);
  });

  async function refresh() {
    const tbody = document.querySelector("#table-commandes-utilisateur tbody");
    const orders = await window.Api.listOrders();
    tbody.innerHTML = "";

    const commandeSelect = document.getElementById("commande-select");
    commandeSelect.innerHTML = "<option value=\"\">Choisir une commande...</option>";

    orders.forEach((o) => {
      if (o.status === "terminee") {
        const option = document.createElement("option");
        option.value = o.id;
        option.textContent = `${o.menuTitre} - ${o.date}`;
        commandeSelect.appendChild(option);
      }
    });

    if (!orders.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = "<td colspan=\"4\"><div class=\"espace-empty\">Aucune commande pour le moment.</div></td>";
      tbody.appendChild(tr);
    }

    orders.forEach((o) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${o.menuTitre}</td><td>${o.date}</td><td>${o.status || "en-attente"}</td>`;
      const tdAct = document.createElement("td");
      const actions = document.createElement("div");
      actions.className = "espace-actions";

      const btnVoir = document.createElement("button");
      btnVoir.textContent = "Voir";
      btnVoir.addEventListener("click", async () => {
        await showModalConfirm(
          `Commande: ${o.menuTitre}\nDate: ${o.date} ${o.heure || ""}\nAdresse: ${o.adresse || ""}\nTotal: ${o.total ? o.total.toFixed(2) + " EUR" : ""}\n\nHistorique:\n${formatOrderHistory(o)}`
        );
      });
      actions.appendChild(btnVoir);

      const btnModifier = document.createElement("button");
      btnModifier.textContent = "Modifier";
      btnModifier.disabled = o.status !== "en-attente";
      btnModifier.addEventListener("click", async () => {
        if (o.status !== "en-attente") return;
        const clientNom = await showModalPrompt("Nouveau nom client", o.clientNom || "");
        if (clientNom === null) return;
        const clientPrenom = await showModalPrompt("Nouveau prénom client", o.clientPrenom || "");
        if (clientPrenom === null) return;
        const clientEmail = await showModalPrompt("Nouvel email client", o.clientEmail || "");
        if (clientEmail === null) return;
        const clientGSM = await showModalPrompt("Nouveau GSM client", o.clientGSM || "");
        if (clientGSM === null) return;
        const adresse = await showModalPrompt("Nouvelle adresse de prestation", o.adresse || "");
        if (adresse === null) return;
        const ville = await showModalPrompt("Nouvelle ville de prestation", o.ville || "Bordeaux");
        if (ville === null) return;
        const kmRaw = await showModalPrompt("Nouveau nombre de kilomètres depuis Bordeaux", String(o.km || 0));
        if (kmRaw === null) return;
        const date = await showModalPrompt("Nouvelle date (YYYY-MM-DD)", o.date || "");
        if (date === null) return;
        const heure = await showModalPrompt("Nouvelle heure (HH:MM)", o.heure || "");
        if (heure === null) return;
        const nbRaw = await showModalPrompt("Nouveau nombre de personnes", String(o.nbPers || ""));
        if (nbRaw === null) return;

        await window.Api.updateOrder(o.id, {
          clientNom,
          clientPrenom,
          clientEmail,
          clientGSM,
          adresse,
          ville,
          km: Number(kmRaw),
          date,
          heure,
          nbPersonnes: Number(nbRaw),
          note: "Commande modifiée par le client"
        });
        await refresh();
      });
      actions.appendChild(btnModifier);

      const btnAnnuler = document.createElement("button");
      btnAnnuler.textContent = "Annuler";
      btnAnnuler.disabled = o.status !== "en-attente";
      btnAnnuler.addEventListener("click", async () => {
        if (o.status !== "en-attente") return;
        const reason = await showModalPrompt("Motif d'annulation", "Motif");
        if (reason === null) return;
        await window.Api.updateOrder(o.id, { status: "annule", note: reason });
        await refresh();
      });
      actions.appendChild(btnAnnuler);

      tdAct.appendChild(actions);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });

    const reviews = await window.Api.myReviews();
    updateKpis(orders, reviews);
    renderMesAvis(document.getElementById("liste-avis"), reviews);
  }

  const formAvis = document.getElementById("form-avis");
  formAvis.addEventListener("submit", async function (e) {
    e.preventDefault();
    const commandeId = document.getElementById("commande-select").value;
    const note = document.getElementById("note").value;
    const commentaire = document.getElementById("commentaire").value.trim();
    if (!commandeId || !note) {
      await showModalConfirm("Veuillez sélectionner une commande terminée et une note.");
      return;
    }
    await window.Api.createReview({
      orderId: Number(commandeId),
      note: Number(note),
      commentaire
    });
    if (avisConfirmation) avisConfirmation.hidden = false;
    formAvis.reset();
    setTimeout(() => {
      if (avisConfirmation) avisConfirmation.hidden = true;
    }, 2000);
    await refresh();
  });

  await refresh();
});
