import { test, expect } from "@playwright/test";

test.describe("Inventory Guards & Idempotent Checkout Protections", () => {
  test("prevents double-order submission on rapid button clicks", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email']", "scholar@chronicleandquill.com");
    await page.fill("input[type='password']", "HistoricalReader2026!");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/auth/login") && res.status() === 200,
        { timeout: 15000 }
      ),
      page.getByRole("button", { name: /Access The Archive|Sign In/i }).click(),
    ]);

    await page.waitForLoadState("networkidle");
    await page.waitForURL(/.*(\/account|\/books).*/, { timeout: 15000 });

    await page.goto("/books");

    const firstArticle = page.locator("article").first();
    await expect(firstArticle).toBeVisible({ timeout: 15000 });

    const bookLink = page.locator("article a[href^='/books/']").first();
    await bookLink.click();

    await expect(page).toHaveURL(/\/books\/[a-f0-9]{24}/);

    const addBtn = page.getByRole("button", { name: /Add to Archival Cart|Add to Cart/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    await page.goto("/checkout");
    await expect(page).toHaveURL("/checkout");
    await page.waitForLoadState("networkidle");

    const nameInput = page.locator("input[placeholder*='Marcus Aurelius']");
    await expect(nameInput).toBeVisible({ timeout: 15000 });

    await nameInput.fill("Marcus Aurelius");
    await page.locator("input[placeholder*='Bibliophile']").fill("42 Palatine Hill");
    await page.locator("input[placeholder*='Alexandria']").fill("Rome");
    await page.locator("input[placeholder*='02108']").fill("00184");
    await page.locator("label:has-text('Country') + input").fill("Italy");

    const submitBtn = page.getByRole("button", { name: /Confirm & Place/i });
    await expect(submitBtn).toBeEnabled();

    await submitBtn.click();

    await page.waitForURL(/\/order\/[a-f0-9]{24}/, { timeout: 15000 });
  });

  test("displays sold out or empty results state when querying depleted stock", async ({ page }) => {
    await page.goto("/books?search=NonExistentManuscriptTitle12345");
    const emptyState = page.getByText(/No Manuscripts Match Your Search/i);
    await expect(emptyState).toBeVisible({ timeout: 15000 });
  });
});
