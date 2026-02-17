const bcrypt = require("bcryptjs");

const PASSWORD_REGEX = /(?=.{10,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

function isStrongPassword(password) {
  return PASSWORD_REGEX.test(password || "");
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  isStrongPassword,
  hashPassword,
  verifyPassword
};

