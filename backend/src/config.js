const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const PORT = parseInt(process.env.PORT || "3000", 10);
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/vite_gourmand";
const DB_SSL = String(process.env.DB_SSL || "false").toLowerCase() === "true";
const DB_SCHEMA_PATH = process.env.DB_SCHEMA_PATH || "";
const NOSQL_PATH = process.env.NOSQL_PATH || path.join(process.cwd(), "backend", "data", "orders_stats.json");
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const CONTACT_TO = process.env.CONTACT_TO || "";
const CONTACT_FROM = process.env.CONTACT_FROM || SMTP_USER || "no-reply@vite-gourmand.local";

module.exports = {
  JWT_SECRET,
  PORT,
  DATABASE_URL,
  DB_SSL,
  DB_SCHEMA_PATH,
  NOSQL_PATH,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_TO,
  CONTACT_FROM
};
