import { test, expect } from "@playwright/test";

/**
 * These tests hit the real Quran.com API (see src/features/quran/api.ts) and
 * therefore need outbound network access to api.quran.com. They will fail in
 * network-restricted sandboxes but should pass in CI/production.
 */
test.describe("Quran reader", () => {
  test("lists surahs and can be filtered by search", async ({ page }) => {
    await page.goto("/en/quran");
    await expect(
      page.getByRole("heading", { name: "The Quran" }),
    ).toBeVisible();

    const search = page.getByPlaceholder("Search surahs…");
    await search.fill("Fatihah");
    await expect(page.getByRole("link", { name: /Al-Fatihah/i })).toBeVisible();
  });

  test("opens a surah and toggles the translation", async ({ page }) => {
    await page.goto("/en/quran/1");
    await expect(page.getByText("1. Al-Fatihah")).toBeVisible();

    const toggle = page.getByRole("switch");
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
  });
});
