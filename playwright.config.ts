import { defineConfig, devices } from "@playwright/test";

// Tests run against their own database (reset in global-setup) and their own dev server.
// Locally: start Postgres with `npm run db:local` first. CI provides TEST_DATABASE_URL.
export const PORT = 3200;
const DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/carsucomits_test";
// Locally we use the installed Chrome; CI installs Playwright's bundled Chromium.
const channel = process.env.CI ? undefined : "chrome";

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  workers: 1, // one shared database
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel } },
  ],
  timeout: 60_000,
  webServer: {
    // Serves the production build (`npm run test:e2e` builds first). Dev mode
    // recompiles every page on first hit and makes the suite time out.
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { DATABASE_URL, AUTH_SECRET: "e2e-secret-that-is-at-least-32-characters-long" },
  },
});
