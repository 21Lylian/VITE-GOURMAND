// Role du fichier : acces base de donnees pour les parametres du site.
const { one, query } = require("../db/postgres");

// Role : fonction parseValue pour isoler une action reutilisable.
function parseValue(value) {
  if (!value) return {};
  if (typeof value === "string") return JSON.parse(value);
  return value;
}

// Role : fonction getBusinessHours pour isoler une action reutilisable.
async function getBusinessHours(client = null) {
  const row = await one("SELECT value_json FROM settings WHERE key = 'business_hours'", [], client);
  return row ? parseValue(row.value_json) : {};
}

// Role : fonction upsertBusinessHours pour isoler une action reutilisable.
async function upsertBusinessHours(hours, client = null) {
  await query(`
    INSERT INTO settings (key, value_json) VALUES ('business_hours', $1::jsonb)
    ON CONFLICT(key) DO UPDATE SET value_json = EXCLUDED.value_json
  `, [JSON.stringify(hours)], client);
  return hours;
}

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = {
  getBusinessHours,
  upsertBusinessHours
};
