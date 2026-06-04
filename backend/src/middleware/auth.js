// Role du fichier : middleware JWT et controle des roles.
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

// Role : fonction requireAuth pour isoler une action reutilisable.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Token manquant." });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (_err) {
    return res.status(401).json({ error: "Token invalide." });
  }
}

// Role : fonction requireRole pour isoler une action reutilisable.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acces interdit." });
    }
    return next();
  };
}

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = {
  requireAuth,
  requireRole
};

