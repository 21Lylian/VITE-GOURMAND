// Role du fichier : logique metier admin pour les comptes employes.
const userRepository = require("../repositories/userRepository");
const { isStrongPassword, hashPassword } = require("../utils/password");

// Role : fonction createEmployee pour isoler une action reutilisable.
async function createEmployee(payload) {
  const { email, password } = payload || {};
  if (!email || !password) return { status: 400, body: { error: "Email et mot de passe requis." } };
  const normalizedEmail = String(email).trim().toLowerCase();
  if (normalizedEmail.includes("admin")) {
    return { status: 400, body: { error: "Creation de compte admin interdite." } };
  }
  if (!isStrongPassword(password)) {
    return { status: 400, body: { error: "Mot de passe trop faible." } };
  }
  const exists = await userRepository.findByEmail(normalizedEmail);
  if (exists) return { status: 409, body: { error: "Compte deja existant." } };
  const passwordHash = await hashPassword(password);
  const employee = await userRepository.createEmployee(normalizedEmail, passwordHash);
  return { status: 201, body: { id: employee.id, email: employee.email, role: employee.role } };
}

// Role : fonction setEmployeeDisabled pour isoler une action reutilisable.
async function setEmployeeDisabled(id, disabled) {
  const employee = await userRepository.setEmployeeDisabled(id, Boolean(disabled));
  if (!employee) return { status: 404, body: { error: "Employe introuvable." } };
  return { status: 200, body: employee };
}

// Role : fonction listEmployees pour isoler une action reutilisable.
async function listEmployees() {
  return { status: 200, body: await userRepository.listEmployees() };
}

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = {
  createEmployee,
  setEmployeeDisabled,
  listEmployees
};
