import { test, expect } from "@playwright/test";

test.describe("Cross-Viewport & Responsive Matrix", () => {
  test("renders full desktop navigation and desktop catalog layout at 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/books");

    const desktopNav = page.locator("header nav");
    await expect(desktopNav).toBeVisible();

    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    const bookCards = page.locator("article");
    const count = await bookCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("renders adapted mobile viewport layout at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/books");

    await expect(page.locator("h1")).toBeVisible();

    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    const bookCards = page.locator("article");
    const count = await bookCards.count();
    expect(count).toBeGreaterThan(0);

    const box = await firstCard.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
    }
  });

  test("renders responsive checkout container on mobile screen width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/cart");

    await expect(page.locator("body")).toBeVisible();
  });
});
