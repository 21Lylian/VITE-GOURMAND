const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const { JWT_SECRET } = require("../config");
const { isStrongPassword, hashPassword, verifyPassword } = require("../utils/password");

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    role: user.role,
    gsm: user.gsm,
    adresse: user.adresse,
    disabled: user.disabled,
    created_at: user.created_at
  };
}

async function register(payload) {
  const { nom, prenom, email, password, gsm = "", adresse = "" } = payload || {};
  if (!nom || !prenom || !email || !password) {
    return { status: 400, body: { error: "Champs obligatoires manquants." } };
  }
  if (!isStrongPassword(password)) {
    return { status: 400, body: { error: "Mot de passe trop faible." } };
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    return { status: 409, body: { error: "Un compte existe deja avec cet email." } };
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.createUser({
    nom: String(nom).trim(),
    prenom: String(prenom).trim(),
    email: normalizedEmail,
    passwordHash,
    role: "utilisateur",
    gsm: String(gsm).trim(),
    adresse: String(adresse).trim()
  });

  return { status: 201, body: { user: sanitizeUser(user), message: "Inscription reussie." } };
}

async function login(payload) {
  const { email, password } = payload || {};
  if (!email || !password) {
    return { status: 400, body: { error: "Email et mot de passe requis." } };
  }
  const user = await userRepository.findByEmail(String(email).toLowerCase().trim());
  if (!user || user.disabled) {
    return { status: 401, body: { error: "Identifiants invalides." } };
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return { status: 401, body: { error: "Identifiants invalides." } };
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, nom: user.nom, prenom: user.prenom },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
  return { status: 200, body: { token, user: sanitizeUser(user) } };
}

async function requestPasswordReset(payload) {
  const { email } = payload || {};
  if (!email) return { status: 400, body: { error: "Email requis." } };
  const user = await userRepository.findByEmail(String(email).toLowerCase().trim());
  if (!user) return { status: 200, body: { ok: true } };

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (1000 * 60 * 30)).toISOString();
  await userRepository.createPasswordReset(user.id, token, expiresAt);
  return { status: 200, body: { ok: true, resetToken: token, expiresAt } };
}

async function confirmPasswordReset(payload) {
  const { token, password } = payload || {};
  if (!token || !password) return { status: 400, body: { error: "Token et mot de passe requis." } };
  if (!isStrongPassword(password)) return { status: 400, body: { error: "Mot de passe trop faible." } };

  const reset = await userRepository.findPasswordResetByToken(String(token));
  if (!reset || reset.used) return { status: 400, body: { error: "Token invalide." } };
  if (new Date(reset.expires_at).getTime() < Date.now()) {
    return { status: 400, body: { error: "Token expire." } };
  }

  const passwordHash = await hashPassword(password);
  await userRepository.updatePassword(reset.user_id, passwordHash);
  await userRepository.markPasswordResetUsed(reset.id);
  return { status: 200, body: { ok: true, message: "Mot de passe mis a jour." } };
}

module.exports = {
  register,
  login,
  requestPasswordReset,
  confirmPasswordReset
};
