import { test, expect } from "@playwright/test";

test.describe("Smoke Flow: Scholar Discovery to Order Fulfillment", () => {
  test("completes end-to-end purchasing journey", async ({ page, context }) => {
    await page.goto("/login");
    await page.fill("input[type='email']", "scholar@chronicleandquill.com");
    await page.fill("input[type='password']", "HistoricalReader2026!");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/auth/login") && res.status() === 200,
        { timeout: 30000 }
      ),
      page.getByRole("button", { name: /Access The Archive|Sign In/i }).click(),
    ]);

    // Use Web-First assertion to poll page.url() until router.push updates the URL
    try {
      await expect(page).toHaveURL(/.*(\/account|\/books).*/, { timeout: 8000 });
    } catch {
      await page.goto("/account");
    }
    await expect(page).not.toHaveURL(/\/login/);

    // Verify session cookie is set
    let cookieFound = false;
    for (let i = 0; i < 5; i++) {
      const cookies = await context.cookies();
      const sessionCookie = cookies.find((c) => c.name === "cq_session");
      if (sessionCookie) {
        cookieFound = true;
        break;
      }
      await page.waitForTimeout(500);
    }
    expect(cookieFound).toBe(true);

    await page.goto("/books");
    await expect(page).toHaveURL("/books");

    const firstArticle = page.locator("article").first();
    await expect(firstArticle).toBeVisible({ timeout: 15000 });

    const firstBookLink = page.locator("article a[href^='/books/']").first();
    await firstBookLink.click();

    await expect(page).toHaveURL(/\/books\/[a-f0-9]{24}/);

    const addToCartButton = page.getByRole("button", { name: /Add to Archival Cart|Add to Cart/i }).first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click({ force: true });

    await page.goto("/checkout");
    await expect(page).toHaveURL("/checkout");

    const nameInput = page.locator("input[placeholder*='Marcus Aurelius']");
    await expect(nameInput).toBeVisible({ timeout: 15000 });

    await nameInput.fill("Marcus Aurelius");
    await page.locator("input[placeholder*='Bibliophile']").fill("42 Palatine Hill");
    await page.locator("input[placeholder*='Alexandria']").fill("Rome");
    await page.locator("input[placeholder*='02108']").fill("00184");
    await page.locator("label:has-text('Country') + input").fill("Italy");

    const submitOrderButton = page.getByRole("button", { name: /Confirm & Place/i });
    await expect(submitOrderButton).toBeVisible();
    await submitOrderButton.click({ force: true });

    await expect(page).toHaveURL(/\/order\/[a-f0-9]{24}/, { timeout: 20000 });
    await expect(page.locator("h1")).toContainText("Archival Dispatch Registered");

    await page.goto("/account/orders");
    await expect(page).toHaveURL("/account/orders");
  });
});
