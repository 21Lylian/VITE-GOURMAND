require("dotenv").config();

const app = require("./app");
const { PORT } = require("./config");
const { initDb } = require("./db/postgres");

async function start() {
  await initDb();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API started on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start API:", err);
  process.exit(1);
});
