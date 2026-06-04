// Role du fichier : acces base de donnees pour les messages de contact.
const { one, many } = require("../db/postgres");

// Role : fonction createContact pour isoler une action reutilisable.
async function createContact({ title, description, email }, client = null) {
  return one(`
    INSERT INTO contacts (title, description, email)
    VALUES ($1, $2, $3)
    RETURNING id, title, description, email, created_at
  `, [title, description, email], client);
}

// Role : fonction listContacts pour isoler une action reutilisable.
async function listContacts(client = null) {
  return many(`
    SELECT id, title, description, email, created_at
    FROM contacts
    ORDER BY id DESC
  `, [], client);
}

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = {
  createContact,
  listContacts
};
