// Role du fichier : regles front-end de transition des statuts de commande.
// Règles de transition de statuts selon le rôle (front-end demo)
(function(){
  // Role : decrit les transitions autorisees par role utilisateur.
  const RULES = {
    utilisateur: {
      'en-attente': ['annule'],
      'accepte': [],
      'preparation': [],
      'livraison': [],
      'livre': [],
      'terminee': [],
      'retour': []
    },
    employe: {
      'en-attente': ['accepte','annule'],
      'accepte': ['preparation','annule'],
      'preparation': ['livraison','annule'],
      'livraison': ['livre','annule'],
      'livre': ['terminee','retour'],
      'terminee': [],
      'retour': ['terminee']
    },
    admin: {
      // admin peut tout faire
    }
  };

  // Role : fonction getAllowedTransitions pour isoler une action reutilisable.
  function getAllowedTransitions(currentStatus, role) {
    if (!currentStatus) currentStatus = 'en-attente';
    if (role === 'admin') return ['en-attente','accepte','preparation','livraison','livre','terminee','retour','annule'];
    const map = RULES[role] || RULES['utilisateur'];
    return (map[currentStatus] || []);
  }

  // Role : expose getAllowedTransitions pour les autres scripts front-end.
  window.getAllowedTransitions = getAllowedTransitions;
})();
