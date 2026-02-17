const DEFAULT_HORAIRES = {
  lundi: "8h-20h",
  mardi: "8h-20h",
  mercredi: "8h-20h",
  jeudi: "8h-20h",
  vendredi: "8h-20h",
  samedi: "8h-20h",
  dimanche: "8h-20h"
};

function getHoraires() {
  const horaires = JSON.parse(localStorage.getItem("horaires") || "null");
  if (!horaires) return Object.assign({}, DEFAULT_HORAIRES);
  return Object.assign({}, DEFAULT_HORAIRES, horaires);
}

function appliquerHorairesFooter() {
  const footer = document.querySelector("footer");
  if (!footer) return;
  const liste = footer.querySelector("section ul");
  if (!liste) return;
  const horaires = getHoraires();
  const lignes = [
    `Lundi : ${horaires.lundi}`,
    `Mardi : ${horaires.mardi}`,
    `Mercredi : ${horaires.mercredi}`,
    `Jeudi : ${horaires.jeudi}`,
    `Vendredi : ${horaires.vendredi}`,
    `Samedi : ${horaires.samedi}`,
    `Dimanche : ${horaires.dimanche}`
  ];
  const items = liste.querySelectorAll("li");
  lignes.forEach((line, index) => {
    if (items[index]) items[index].textContent = line;
  });
}

function appliquerAccessibiliteGlobale() {
  if (!document.documentElement.lang) {
    document.documentElement.lang = "fr";
  }

  const main = document.querySelector("main");
  if (main && !main.id) {
    main.id = "main-content";
  }
  if (main && !main.hasAttribute("tabindex")) {
    main.setAttribute("tabindex", "-1");
  }

  if (!document.querySelector(".skip-link") && main) {
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#main-content";
    skip.textContent = "Aller au contenu";
    document.body.insertBefore(skip, document.body.firstChild);
  }

  const skipLink = document.querySelector(".skip-link");
  if (skipLink && main) {
    skipLink.addEventListener("click", function () {
      window.setTimeout(() => main.focus(), 0);
    });
  }

  document.querySelectorAll("header nav").forEach((nav) => {
    if (!nav.getAttribute("aria-label")) nav.setAttribute("aria-label", "Navigation principale");
  });
  document.querySelectorAll("footer nav").forEach((nav) => {
    if (!nav.getAttribute("aria-label")) nav.setAttribute("aria-label", "Navigation secondaire");
  });

  document.querySelectorAll("input[required], select[required], textarea[required]").forEach((field) => {
    if (!field.getAttribute("aria-required")) field.setAttribute("aria-required", "true");
  });

  document.querySelectorAll("table").forEach((table, index) => {
    const hasCaption = table.querySelector("caption");
    if (!hasCaption) {
      const caption = document.createElement("caption");
      caption.className = "visually-hidden";
      caption.textContent = `Tableau de données ${index + 1}`;
      table.insertBefore(caption, table.firstChild);
    }
  });
}

async function syncHorairesFromApi() {
  if (!window.Api) return;
  try {
    const fromApi = await window.Api.getHours();
    if (fromApi && typeof fromApi === "object") {
      localStorage.setItem("horaires", JSON.stringify(fromApi));
    }
  } catch (_e) {
    // Fallback localStorage only
  }
}

async function renderValidatedReviewsFromApi() {
  const avisList = document.getElementById("avis-clients");
  if (!avisList || !window.Api) return;
  try {
    const reviews = await window.Api.validatedReviews();
    if (Array.isArray(reviews) && reviews.length > 0) {
      avisList.innerHTML = reviews.slice(0, 6).map((a) => {
        const etoiles = "★".repeat(a.note) + "☆".repeat(5 - a.note);
        return `<li class="avis"><strong>${a.menuTitre}</strong> - ${etoiles}<br>${a.commentaire || "Sans commentaire"}</li>`;
      }).join("");
    }
  } catch (_e) {
    const avis = JSON.parse(localStorage.getItem("avis") || "[]");
    const valides = avis.filter((a) => a.valide === true).slice(-6).reverse();
    if (valides.length > 0) {
      avisList.innerHTML = valides.map((a) => {
        const etoiles = "★".repeat(a.note) + "☆".repeat(5 - a.note);
        return `<li class="avis"><strong>${a.menuTitre}</strong> - ${etoiles}<br>${a.commentaire || "Sans commentaire"}</li>`;
      }).join("");
    }
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  appliquerAccessibiliteGlobale();
  await syncHorairesFromApi();
  appliquerHorairesFooter();

  const notif = document.getElementById("notification-bienvenue");
  if (notif) {
    notif.style.display = "block";
    setTimeout(() => {
      notif.style.display = "none";
    }, 3500);
  }

  document.querySelectorAll(".anim-title").forEach((el, i) => {
    el.style.animationDelay = (i * 0.3) + "s";
  });
  document.querySelectorAll(".anim-section").forEach((el, i) => {
    el.style.animationDelay = (0.6 + i * 0.3) + "s";
  });

  await renderValidatedReviewsFromApi();
});

window.addEventListener("storage", function (e) {
  if (e.key === "horaires") appliquerHorairesFooter();
});

window.addEventListener("horaires-updated", appliquerHorairesFooter);

