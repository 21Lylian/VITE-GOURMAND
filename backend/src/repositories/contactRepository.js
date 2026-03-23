const { one, many } = require("../db/postgres");

async function createContact({ title, description, email }, client = null) {
  return one(`
    INSERT INTO contacts (title, description, email)
    VALUES ($1, $2, $3)
    RETURNING id, title, description, email, created_at
  `, [title, description, email], client);
}

async function listContacts(client = null) {
  return many(`
    SELECT id, title, description, email, created_at
    FROM contacts
    ORDER BY id DESC
  `, [], client);
}

module.exports = {
  createContact,
  listContacts
};
