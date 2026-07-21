import { test, expect } from "@playwright/test";

test("redirects the bare root to the default locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
});

test("home page links to the Quran section", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Start reading" }).click();
  await expect(page).toHaveURL(/\/en\/quran$/);
});

test("locale switcher flips the document to RTL Arabic", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "العربية" }).click();
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
});

test("login and signup forms render with required fields", async ({ page }) => {
  await page.goto("/en/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();

  // Both the header nav and the form footer link to /signup; either works.
  await page.getByRole("link", { name: "Sign up" }).first().click();
  await expect(page).toHaveURL(/\/en\/signup$/);
  await expect(page.getByLabel("Email")).toBeVisible();
});
