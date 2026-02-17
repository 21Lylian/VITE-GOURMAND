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

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "vite-gourmand-api" });
});

app.use("/api", authRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/me", meRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/manage", managementRoutes);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Erreur serveur." });
});

module.exports = app;
