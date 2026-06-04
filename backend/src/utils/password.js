// Role du fichier : validation, hash et verification des mots de passe.
const bcrypt = require("bcryptjs");

const PASSWORD_REGEX = /(?=.{10,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

// Role : fonction isStrongPassword pour isoler une action reutilisable.
function isStrongPassword(password) {
  return PASSWORD_REGEX.test(password || "");
}

// Role : fonction hashPassword pour isoler une action reutilisable.
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// Role : fonction verifyPassword pour isoler une action reutilisable.
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = {
  isStrongPassword,
  hashPassword,
  verifyPassword
};

