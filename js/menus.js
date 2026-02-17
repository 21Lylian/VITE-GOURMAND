function afficherMenus(menus) {
  const liste = document.getElementById("liste-menus");
  if (!liste) return;
  liste.innerHTML = "";
  if (!menus || menus.length === 0) {
    liste.innerHTML = "<p>Aucun menu ne correspond a vos criteres.</p>";
    return;
  }

  menus.forEach((menu, idx) => {
    const div = document.createElement("div");
    div.className = "menu";
    div.style.animationDelay = `${idx * 0.1}s`;
    div.innerHTML = `
      <h3>${menu.titre}</h3>
      <p>${menu.description}</p>
      <p><strong>A partir de ${menu.nbPersonnes} pers. - ${menu.prix} EUR</strong></p>
      <p>Theme: ${menu.theme} | Regime: ${menu.regime}</p>
      <p>Stock disponible: ${menu.stock || 0}</p>
      <div class="menu-thumbs">
        ${(menu.images || []).slice(0, 2).map((src) => `<img src="${src}" alt="${menu.titre}">`).join("")}
      </div>
      <button data-id="${menu.id}">Voir le detail</button>
    `;

    div.querySelector("button").addEventListener("click", function () {
      window.location = `menu-detail.html?id=${menu.id}`;
    });
    liste.appendChild(div);
  });
}

function getFiltres() {
  const prixMinRaw = document.getElementById("prix-min").value;
  const prixMaxRaw = document.getElementById("prix-max").value;
  const nbPersonnesRaw = document.getElementById("nb-personnes").value;
  return {
    prixMin: prixMinRaw ? Number(prixMinRaw) : undefined,
    prixMax: prixMaxRaw ? Number(prixMaxRaw) : undefined,
    theme: document.getElementById("theme").value || undefined,
    regime: document.getElementById("regime").value || undefined,
    nbPersonnes: nbPersonnesRaw ? Number(nbPersonnesRaw) : undefined
  };
}

function filtrerMenusLocaux(menus, filtres) {
  return (menus || []).filter((m) => {
    if (filtres.prixMin !== undefined && Number(m.prix) < filtres.prixMin) return false;
    if (filtres.prixMax !== undefined && Number(m.prix) > filtres.prixMax) return false;
    if (filtres.theme && String(m.theme) !== String(filtres.theme)) return false;
    if (filtres.regime && String(m.regime) !== String(filtres.regime)) return false;
    if (filtres.nbPersonnes !== undefined && Number(m.nbPersonnes) < filtres.nbPersonnes) return false;
    return true;
  });
}

async function chargerMenus() {
  const filtres = getFiltres();
  try {
    const menus = await window.Api.menus(filtres);
    afficherMenus(menus);
  } catch (err) {
    // Fallback local si l'API n'est pas demarree.
    if (window.AppData && typeof window.AppData.getMenus === "function") {
      const locaux = filtrerMenusLocaux(window.AppData.getMenus(), filtres);
      afficherMenus(locaux);
      return;
    }
    const liste = document.getElementById("liste-menus");
    if (liste) liste.innerHTML = `<p>Erreur de chargement des menus: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  chargerMenus();
  const form = document.getElementById("form-filtres");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      chargerMenus();
    });
  }
  ["prix-min", "prix-max", "theme", "regime", "nb-personnes"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", chargerMenus);
    el.addEventListener("change", chargerMenus);
  });
});
