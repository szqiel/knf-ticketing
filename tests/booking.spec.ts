import { test, expect } from "@playwright/test";

const slug = process.env.PROGRAM_SLUG ?? "goresan-awal";

test.describe("booking flow", () => {
  test.skip(!process.env.RUN_E2E, "Set RUN_E2E=1 to run against a configured database.");

  test("shows blocked front seats and opens the details form", async ({ page, request }) => {
    const session = await request.post("/api/booking/session");
    expect(session.ok()).toBeTruthy();
    const { sessionToken } = await session.json();
    await page.goto(`/p/${slug}/seats?session=${encodeURIComponent(sessionToken)}`);
    await expect(page.getByRole("region", { name: "Interactive seat map" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Seat D13, blocked/i })).toBeDisabled();
    const available = page.locator('button[aria-label^="Seat "]:not([aria-label*=","])').first();
    await available.click();
    await page.getByRole("button", { name: /Confirm Seats/i }).click();
    await expect(page.getByRole("heading", { name: /Your details/i })).toBeVisible();
  });
});
