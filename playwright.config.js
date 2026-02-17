// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120000,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true
  },
  webServer: [
    {
      command: 'npx http-server . -p 4173 -c-1',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      timeout: 120000
    },
    {
      command: 'node backend/src/server.js',
      url: 'http://127.0.0.1:3000/api/health',
      reuseExistingServer: false,
      timeout: 120000
    }
  ]
});
