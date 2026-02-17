function calculateOrderPrice(menu, nbPersonnes, city, km) {
  const ratio = nbPersonnes / menu.nb_personnes_min;
  const menuGross = menu.prix * ratio;
  const discount = nbPersonnes >= (menu.nb_personnes_min + 5) ? menuGross * 0.1 : 0;
  const menuNet = menuGross - discount;
  const outsideBordeaux = (city || "").trim().toLowerCase() !== "bordeaux";
  const deliveryFee = outsideBordeaux ? (5 + (0.59 * km)) : 0;

  return {
    menuGross,
    discount,
    menuNet,
    deliveryFee,
    total: menuNet + deliveryFee
  };
}

module.exports = { calculateOrderPrice };

