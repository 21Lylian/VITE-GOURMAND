// Role du fichier : affichage detaille d un menu.
// Role : fonction getMenuId pour isoler une action reutilisable.
function getMenuId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("id"), 10);
}

// Role : fonction afficherDetailMenu pour isoler une action reutilisable.
function afficherDetailMenu(menu) {
  const section = document.getElementById("menu-detail");
  const btnCommander = document.getElementById("btn-commander");
  if (!section || !btnCommander) return;

  if (!menu) {
    section.innerHTML = "<p>Menu introuvable.</p>";
    btnCommander.style.display = "none";
    return;
  }

  section.innerHTML = `
    <h2>${menu.titre}</h2>
    <p>${menu.description}</p>
    <div class="gallery">
      ${(menu.images || []).map((src) => `<img src="${src}" alt="${menu.titre}">`).join("")}
    </div>
    <p><strong>Theme:</strong> ${menu.theme}</p>
    <p><strong>Regime:</strong> ${menu.regime}</p>
    <h3>Plats et allergenes</h3>
    <ul>
      ${(menu.plats || []).map((p) => `
        <li>
          <strong>${p.type}:</strong> ${p.nom}
          ${p.allergenes && p.allergenes.length ? `<small class="allergenes">(Allergenes: ${p.allergenes.join(", ")})</small>` : ""}
        </li>`).join("")}
    </ul>
    <p><strong>Nombre minimum de personnes:</strong> ${menu.nbPersonnes}</p>
    <p><strong>Prix de base:</strong> ${menu.prix} EUR</p>
    <div class="menu-conditions-alerte">
      <p class="conditions-label"><strong>Conditions importantes</strong></p>
      <p class="conditions-texte">${menu.conditions}</p>
    </div>
    <p><strong>Stock disponible:</strong> ${menu.stock || 0}</p>
  `;
}

// Role : initialise la page quand le HTML est pret.
document.addEventListener("DOMContentLoaded", async function () {
  const id = getMenuId();
  if (!Number.isFinite(id)) {
    afficherDetailMenu(null);
    return;
  }

  let menu = null;
  try {
    menu = await window.Api.menuById(id);
  } catch (_err) {
    menu = null;
  }

  if (!menu && window.AppData && typeof window.AppData.getMenuById === "function") {
    menu = window.AppData.getMenuById(id);
  }

  afficherDetailMenu(menu);

  const btnCommander = document.getElementById("btn-commander");
  if (!btnCommander) return;
  btnCommander.addEventListener("click", function () {
    const user = window.Api.getUser();
    if (!user) {
      // Role : redirige l utilisateur vers une autre page.
      window.location = `connexion.html?next=${encodeURIComponent(`commande.html?id=${id}`)}`;
      return;
    }
    // Role : redirige l utilisateur vers une autre page.
    window.location = `commande.html?id=${id}`;
  });
});
