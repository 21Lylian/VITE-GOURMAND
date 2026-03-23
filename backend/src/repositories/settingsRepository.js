const { one, query } = require("../db/postgres");

function parseValue(value) {
  if (!value) return {};
  if (typeof value === "string") return JSON.parse(value);
  return value;
}

async function getBusinessHours(client = null) {
  const row = await one("SELECT value_json FROM settings WHERE key = 'business_hours'", [], client);
  return row ? parseValue(row.value_json) : {};
}

async function upsertBusinessHours(hours, client = null) {
  await query(`
    INSERT INTO settings (key, value_json) VALUES ('business_hours', $1::jsonb)
    ON CONFLICT(key) DO UPDATE SET value_json = EXCLUDED.value_json
  `, [JSON.stringify(hours)], client);
  return hours;
}

module.exports = {
  getBusinessHours,
  upsertBusinessHours
};
