// Règles de transition de statuts selon le rôle (front-end demo)
(function(){
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

  function getAllowedTransitions(currentStatus, role) {
    if (!currentStatus) currentStatus = 'en-attente';
    if (role === 'admin') return ['en-attente','accepte','preparation','livraison','livre','terminee','retour','annule'];
    const map = RULES[role] || RULES['utilisateur'];
    return (map[currentStatus] || []);
  }

  window.getAllowedTransitions = getAllowedTransitions;
})();
