// Role du fichier : configuration Express et montage des routes API.
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth");
const menuRoutes = require("./routes/menus");
const orderRoutes = require("./routes/orders");
const statsRoutes = require("./routes/stats");
const contactRoutes = require("./routes/contact");
const adminRoutes = require("./routes/admin");
const meRoutes = require("./routes/me");
const settingsRoutes = require("./routes/settings");
const reviewRoutes = require("./routes/reviews");
const managementRoutes = require("./routes/management");

const app = express();

// Role : active un middleware global Express.
app.use(helmet());
// Role : active un middleware global Express.
app.use(cors({ origin: true, credentials: true }));
// Role : active un middleware global Express.
app.use(express.json({ limit: "1mb" }));

// Role : endpoint de verification /api/health.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "vite-gourmand-api" });
});

// Role : branche un groupe de routes sur /api.
app.use("/api", authRoutes);
// Role : branche un groupe de routes sur /api/menus.
app.use("/api/menus", menuRoutes);
// Role : branche un groupe de routes sur /api/orders.
app.use("/api/orders", orderRoutes);
// Role : branche un groupe de routes sur /api/stats.
app.use("/api/stats", statsRoutes);
// Role : branche un groupe de routes sur /api/contact.
app.use("/api/contact", contactRoutes);
// Role : branche un groupe de routes sur /api/admin.
app.use("/api/admin", adminRoutes);
// Role : branche un groupe de routes sur /api/me.
app.use("/api/me", meRoutes);
// Role : branche un groupe de routes sur /api/settings.
app.use("/api/settings", settingsRoutes);
// Role : branche un groupe de routes sur /api/reviews.
app.use("/api/reviews", reviewRoutes);
// Role : branche un groupe de routes sur /api/manage.
app.use("/api/manage", managementRoutes);

// Role : gere les erreurs serveur non interceptees.
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Erreur serveur." });
});

// Role : exporte les fonctions utilisees par les autres modules.
module.exports = app;
