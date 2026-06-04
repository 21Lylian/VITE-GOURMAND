// Role du fichier : regles back-end de transition des statuts de commande.
const ORDER_STATUS = {
  PENDING: "en-attente",
  ACCEPTED: "accepte",
  PREPARATION: "preparation",
  DELIVERY: "livraison",
  DELIVERED: "livre",
  RETURN_PENDING: "retour",
  DONE: "terminee",
  CANCELED: "annule"
};

const STAFF_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PREPARATION, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.PREPARATION]: [ORDER_STATUS.DELIVERY, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.DELIVERY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURN_PENDING, ORDER_STATUS.DONE],
  [ORDER_STATUS.RETURN_PENDING]: [ORDER_STATUS.DONE],
  [ORDER_STATUS.DONE]: [],
  [ORDER_STATUS.CANCELED]: []
};

// Role : fonction isAllowedStaffTransition pour isoler une action reutilisable.
function isAllowedStaffTransition(fromStatus, toStatus) {
  if (!STAFF_TRANSITIONS[fromStatus]) return false;
  return STAFF_TRANSITIONS[fromStatus].includes(toStatus);
}

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = {
  ORDER_STATUS,
  isAllowedStaffTransition
};

