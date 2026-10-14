import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3000", trace: "on-first-retry", ...devices["Desktop Chrome"] },
  webServer: process.env.PLAYWRIGHT_USE_WEBSERVER === "1" ? { command: "npm run dev -- --hostname 127.0.0.1", url: "http://127.0.0.1:3000/api/health", reuseExistingServer: true, timeout: 120_000 } : undefined,
});
