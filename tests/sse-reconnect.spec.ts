import { test, expect } from "@playwright/test";

test("seat stream reconnects and emits ready", async ({ page }) => {
  test.skip(!process.env.RUN_E2E || !process.env.PROGRAM_ID, "Set RUN_E2E=1 and PROGRAM_ID for SSE testing.");
  await page.goto("/");
  const result = await page.evaluate(async (programId) => {
    const connect = () => new Promise<string>((resolve, reject) => {
      const source = new EventSource(`/api/programs/${programId}/stream`);
      const timer = window.setTimeout(() => { source.close(); reject(new Error("SSE timeout")); }, 8_000);
      source.addEventListener("ready", () => { window.clearTimeout(timer); source.close(); resolve("ready"); });
      source.onerror = () => { window.clearTimeout(timer); source.close(); reject(new Error("SSE error")); };
    });
    await connect();
    return connect();
  }, process.env.PROGRAM_ID);
  expect(result).toBe("ready");
});
