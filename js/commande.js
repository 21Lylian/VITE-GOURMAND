function getMenuIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("id"), 10);
}

function toMoney(value) {
  return `${Number(value).toFixed(2)} EUR`;
}

function calculerPrix(menu, nbPers, ville, km) {
  const ratio = nbPers / menu.nbPersonnes;
  const prixMenuBrut = menu.prix * ratio;
  const remise = nbPers >= (menu.nbPersonnes + 5) ? prixMenuBrut * 0.1 : 0;
  const prixMenuNet = prixMenuBrut - remise;
  const horsBordeaux = ville.trim().toLowerCase() !== "bordeaux";
  const fraisLivraison = horsBordeaux ? (5 + (0.59 * km)) : 0;
  return {
    prixMenuBrut,
    remise,
    prixMenuNet,
    fraisLivraison,
    total: prixMenuNet + fraisLivraison
  };
}

document.addEventListener("DOMContentLoaded", async function () {
  const user = window.Api.getUser();
  if (!user) {
    window.location = "connexion.html?next=commande.html";
    return;
  }

  const form = document.getElementById("form-commande");
  const recap = document.getElementById("recapitulatif");
  const confirmation = document.getElementById("confirmation-commande");
  const menuSelect = document.getElementById("menu-id");
  const nbPersInput = document.getElementById("nb-personnes");
  const villeInput = document.getElementById("ville");
  const kmInput = document.getElementById("km");
  const adresseInput = document.getElementById("adresse");
  const nomInput = document.getElementById("nom");
  const prenomInput = document.getElementById("prenom");
  const emailInput = document.getElementById("email");
  const gsmInput = document.getElementById("gsm");

  let menus = [];
  let apiAvailable = true;
  try {
    menus = await window.Api.menus();
  } catch (err) {
    apiAvailable = false;
    if (window.AppData && typeof window.AppData.getMenus === "function") {
      menus = window.AppData.getMenus();
      await showModalConfirm("API indisponible: menus charges en mode local. La validation de commande necessite le serveur API.");
    } else {
      await showModalConfirm(`Impossible de charger les menus: ${err.message}`);
      return;
    }
  }

  if (!menus.length) {
    await showModalConfirm("Aucun menu disponible.");
    return;
  }

  menuSelect.innerHTML = menus.map((m) =>
    `<option value="${m.id}">${m.titre} - min ${m.nbPersonnes} pers - ${m.prix} EUR</option>`
  ).join("");
  const menuIdFromUrl = getMenuIdFromUrl();
  if (menuIdFromUrl && menus.some((m) => m.id === menuIdFromUrl)) {
    menuSelect.value = String(menuIdFromUrl);
  }

  nomInput.value = user.nom || "";
  prenomInput.value = user.prenom || "";
  emailInput.value = user.email || "";
  gsmInput.value = user.gsm || "";
  villeInput.value = "Bordeaux";

  function getMenuSelectionne() {
    const menuId = parseInt(menuSelect.value, 10);
    return menus.find((m) => m.id === menuId) || null;
  }

  function updateRecap() {
    const menu = getMenuSelectionne();
    if (!menu) {
      recap.innerHTML = "<p>Menu introuvable.</p>";
      return;
    }
    if (!nbPersInput.value) nbPersInput.value = String(menu.nbPersonnes);
    nbPersInput.min = String(menu.nbPersonnes);
    const nbPers = parseInt(nbPersInput.value, 10) || menu.nbPersonnes;
    const km = parseFloat(kmInput.value) || 0;
    const details = calculerPrix(menu, nbPers, villeInput.value || "", km);
    recap.innerHTML = `
      <p><strong>Recapitulatif</strong></p>
      <p>Menu: ${menu.titre}</p>
      <p>Prix menu (base): ${toMoney(details.prixMenuBrut)}</p>
      <p>Remise: -${toMoney(details.remise)}</p>
      <p>Menu apres remise: ${toMoney(details.prixMenuNet)}</p>
      <p>Livraison: ${toMoney(details.fraisLivraison)}</p>
      <p><strong>Total: ${toMoney(details.total)}</strong></p>
    `;
  }

  [menuSelect, nbPersInput, villeInput, kmInput, adresseInput].forEach((el) => {
    el.addEventListener("input", updateRecap);
    el.addEventListener("change", updateRecap);
  });
  updateRecap();

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!apiAvailable) {
      await showModalConfirm("Le serveur API est indisponible. Lancez l'API pour valider la commande.");
      return;
    }
    const menu = getMenuSelectionne();
    if (!menu) {
      await showModalConfirm("Menu invalide.");
      return;
    }
    const nbPers = parseInt(nbPersInput.value, 10);
    if (nbPers < menu.nbPersonnes) {
      await showModalConfirm(`Le minimum pour ce menu est ${menu.nbPersonnes} personnes.`);
      return;
    }
    try {
      await window.Api.createOrder({
        menuId: menu.id,
        nbPersonnes: nbPers,
        clientNom: nomInput.value.trim(),
        clientPrenom: prenomInput.value.trim(),
        clientEmail: emailInput.value.trim(),
        clientGSM: gsmInput.value.trim(),
        adresse: adresseInput.value.trim(),
        ville: villeInput.value.trim(),
        km: parseFloat(kmInput.value) || 0,
        date: document.getElementById("date").value,
        heure: document.getElementById("heure").value
      });
      confirmation.style.display = "block";
      form.reset();
      menuSelect.value = String(menu.id);
      villeInput.value = "Bordeaux";
      kmInput.value = "0";
      updateRecap();
      setTimeout(() => {
        confirmation.style.display = "none";
        window.location = "espace-utilisateur.html";
      }, 1000);
    } catch (err) {
      await showModalConfirm(err.message || "Erreur lors de la commande.");
    }
  });
});
