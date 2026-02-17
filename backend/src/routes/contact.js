const express = require("express");
const nodemailer = require("nodemailer");
const { db } = require("../db/sqlite");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_TO,
  CONTACT_FROM
} = require("../config");

const router = express.Router();

let transporter = null;

function smtpConfigured() {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && CONTACT_TO);
}

function getTransporter() {
  if (!smtpConfigured()) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
  return transporter;
}

async function sendContactMail({ id, title, description, email, createdAt }) {
  const t = getTransporter();
  if (!t) return false;

  const subject = `[Vite & Gourmand] Nouveau message contact #${id}`;
  const text = [
    `Message #${id}`,
    `Date: ${createdAt}`,
    `Email client: ${email}`,
    `Titre: ${title}`,
    "",
    description
  ].join("\n");

  await t.sendMail({
    from: CONTACT_FROM,
    to: CONTACT_TO,
    replyTo: email,
    subject,
    text
  });

  return true;
}

router.post("/", async (req, res) => {
  const { title, description, email } = req.body || {};
  if (!title || !description || !email) {
    return res.status(400).json({ error: "Titre, description et email sont requis." });
  }

  const normalizedTitle = String(title).trim();
  const normalizedDescription = String(description).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  const createdAt = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO contacts (title, description, email)
    VALUES (?, ?, ?)
  `).run(normalizedTitle, normalizedDescription, normalizedEmail);

  let emailSent = false;
  let emailWarning = null;
  try {
    emailSent = await sendContactMail({
      id: result.lastInsertRowid,
      title: normalizedTitle,
      description: normalizedDescription,
      email: normalizedEmail,
      createdAt
    });
    if (!emailSent) {
      emailWarning = "SMTP non configure. Message enregistre uniquement.";
    }
  } catch (err) {
    emailWarning = `Envoi email echoue: ${err.message}`;
  }

  return res.status(201).json({
    id: result.lastInsertRowid,
    message: emailSent
      ? "Message recu et email de notification envoye."
      : "Message recu.",
    emailSent,
    warning: emailWarning
  });
});

router.get("/", requireAuth, requireRole("employe", "admin"), (_req, res) => {
  const messages = db.prepare(`
    SELECT id, title, description, email, created_at
    FROM contacts
    ORDER BY id DESC
  `).all();
  return res.json(messages);
});

module.exports = router;
