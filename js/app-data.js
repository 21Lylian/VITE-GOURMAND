// Role du fichier : donnees locales de secours pour le front-end.
(function () {
  const DEFAULT_MENUS = [
    {
      id: 1,
      titre: "Menu Noel",
      description: "Un menu festif pour Noel avec produits de saison.",
      prix: 140,
      theme: "noel",
      regime: "classique",
      nbPersonnes: 4,
      images: ["public/noel1.jpg.jpg", "public/noel2.jpg.jpg"],
      plats: [
        { type: "Entree", nom: "Veloute de potimarron", allergenes: ["lait"] },
        { type: "Plat", nom: "Chapon roti", allergenes: ["gluten"] },
        { type: "Dessert", nom: "Buche maison", allergenes: ["oeufs", "lait"] }
      ],
      conditions: "Commande 3 jours à l'avance minimum. Maintien au froid obligatoire.",
      stock: 5
    },
    {
      id: 2,
      titre: "Menu Vegan",
      description: "Une offre complete 100% vegetale.",
      prix: 84,
      theme: "classique",
      regime: "vegan",
      nbPersonnes: 2,
      images: ["public/vegan1.jpg.jpg"],
      plats: [
        { type: "Entree", nom: "Carpaccio de betterave", allergenes: [] },
        { type: "Plat", nom: "Curry de legumes", allergenes: ["soja"] },
        { type: "Dessert", nom: "Mousse coco mangue", allergenes: [] }
      ],
      conditions: "Commande 2 jours à l'avance minimum.",
      stock: 8
    }
  ];

  // Role : fonction clone pour isoler une action reutilisable.
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // Role : fonction ensureMenus pour isoler une action reutilisable.
  function ensureMenus() {
    const existing = JSON.parse(localStorage.getItem("menus") || "null");
    if (!Array.isArray(existing) || existing.length === 0) {
      localStorage.setItem("menus", JSON.stringify(DEFAULT_MENUS));
      return clone(DEFAULT_MENUS);
    }
    const sanitized = existing.filter((m) => String(m.titre || "").toLowerCase() !== "menu paques");
    if (sanitized.length !== existing.length) {
      localStorage.setItem("menus", JSON.stringify(sanitized));
    }
    return sanitized;
  }

  // Role : fonction getMenus pour isoler une action reutilisable.
  function getMenus() {
    return ensureMenus();
  }

  // Role : fonction getMenuById pour isoler une action reutilisable.
  function getMenuById(id) {
    return getMenus().find((m) => m.id === id) || null;
  }

  // Role : fonction ensureStocks pour isoler une action reutilisable.
  function ensureStocks() {
    const menus = getMenus();
    const current = JSON.parse(localStorage.getItem("menuStocks") || "{}");
    menus.forEach((m) => {
      if (typeof current[m.id] !== "number") current[m.id] = m.stock || 0;
    });
    localStorage.setItem("menuStocks", JSON.stringify(current));
    return current;
  }

  // Role : expose AppData pour les autres scripts front-end.
  window.AppData = {
    getMenus,
    getMenuById,
    ensureStocks
  };

  ensureMenus();
  ensureStocks();
})();

