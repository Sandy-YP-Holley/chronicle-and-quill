import { test, expect } from "@playwright/test";

test.describe("Smoke Flow: Scholar Discovery to Order Fulfillment", () => {
  test("completes end-to-end purchasing journey", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email']", "scholar@chronicleandquill.com");
    await page.fill("input[type='password']", "HistoricalReader2026!");
    await page.getByRole("button", { name: /Access The Archive|Sign In/i }).click();
    await page.waitForURL("/account", { timeout: 10000 });

    await page.goto("/books");
    await expect(page).toHaveURL("/books");

    const firstArticle = page.locator("article").first();
    await expect(firstArticle).toBeVisible({ timeout: 15000 });

    const firstBookLink = page.locator("article a[href^='/books/']").first();
    await firstBookLink.click();

    await expect(page).toHaveURL(/\/books\/[a-f0-9]{24}/);

    const addToCartButton = page.getByRole("button", { name: /Add to Archival Cart|Add to Cart/i }).first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    await page.goto("/checkout");
    await expect(page).toHaveURL("/checkout");

    await page.locator("input[placeholder*='Marcus Aurelius']").fill("Marcus Aurelius");
    await page.locator("input[placeholder*='Bibliophile']").fill("42 Palatine Hill");
    await page.locator("input[placeholder*='Alexandria']").fill("Rome");
    await page.locator("input[placeholder*='02108']").fill("00184");
    await page.locator("label:has-text('Country') + input").fill("Italy");

    const submitOrderButton = page.getByRole("button", { name: /Confirm & Place/i });
    await expect(submitOrderButton).toBeVisible();
    await submitOrderButton.click();

    await page.waitForURL(/\/order\/[a-f0-9]{24}/, { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Archival Dispatch Registered");

    await page.goto("/account/orders");
    await expect(page).toHaveURL("/account/orders");
  });
});
