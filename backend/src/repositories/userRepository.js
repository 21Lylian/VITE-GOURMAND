const { one, many, query } = require("../db/postgres");

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email,
    role: row.role,
    gsm: row.gsm,
    adresse: row.adresse,
    disabled: row.disabled,
    created_at: row.created_at,
    password_hash: row.password_hash
  };
}

async function findByEmail(email, client = null) {
  const row = await one(`
    SELECT id, nom, prenom, email, role, gsm, adresse, disabled, created_at, password_hash
    FROM users
    WHERE email = $1
  `, [email], client);
  return mapUser(row);
}

async function findById(id, client = null) {
  const row = await one(`
    SELECT id, nom, prenom, email, role, gsm, adresse, disabled, created_at
    FROM users
    WHERE id = $1
  `, [id], client);
  return mapUser(row);
}

async function createUser(data, client = null) {
  const row = await one(`
    INSERT INTO users (nom, prenom, email, password_hash, role, gsm, adresse, disabled)
    VALUES ($1, $2, $3, $4, $5, $6, $7, false)
    RETURNING id, nom, prenom, email, role, gsm, adresse, disabled, created_at
  `, [data.nom, data.prenom, data.email, data.passwordHash, data.role, data.gsm, data.adresse], client);
  return mapUser(row);
}

async function updateProfile(id, payload, client = null) {
  const fields = [];
  const values = [];
  let index = 1;

  ["nom", "prenom", "gsm", "adresse"].forEach((key) => {
    if (payload[key] !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(payload[key]);
      index += 1;
    }
  });

  if (!fields.length) return findById(id, client);

  values.push(id);
  const row = await one(`
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING id, nom, prenom, email, role, gsm, adresse, disabled, created_at
  `, values, client);
  return mapUser(row);
}

async function createPasswordReset(userId, token, expiresAt, client = null) {
  return one(`
    INSERT INTO password_resets (user_id, token, expires_at, used)
    VALUES ($1, $2, $3, false)
    RETURNING id, user_id, token, expires_at, used, created_at
  `, [userId, token, expiresAt], client);
}

async function findPasswordResetByToken(token, client = null) {
  return one(`
    SELECT id, user_id, token, expires_at, used, created_at
    FROM password_resets
    WHERE token = $1
  `, [token], client);
}

async function markPasswordResetUsed(id, client = null) {
  await query("UPDATE password_resets SET used = true WHERE id = $1", [id], client);
}

async function updatePassword(id, passwordHash, client = null) {
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, id], client);
}

async function createEmployee(email, passwordHash, client = null) {
  const row = await one(`
    INSERT INTO users (nom, prenom, email, password_hash, role, gsm, adresse, disabled)
    VALUES ('', '', $1, $2, 'employe', '', '', false)
    RETURNING id, email, role, disabled, created_at
  `, [email, passwordHash], client);
  return row;
}

async function setEmployeeDisabled(id, disabled, client = null) {
  const row = await one(`
    UPDATE users
    SET disabled = $1
    WHERE id = $2 AND role = 'employe'
    RETURNING id, email, role, disabled, created_at
  `, [disabled, id], client);
  return row;
}

async function listEmployees(client = null) {
  return many(`
    SELECT id, email, role, disabled, created_at
    FROM users
    WHERE role = 'employe'
    ORDER BY id DESC
  `, [], client);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateProfile,
  createPasswordReset,
  findPasswordResetByToken,
  markPasswordResetUsed,
  updatePassword,
  createEmployee,
  setEmployeeDisabled,
  listEmployees
};
