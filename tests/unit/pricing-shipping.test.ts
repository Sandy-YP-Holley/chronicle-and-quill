import { describe, it, expect } from "vitest";

interface PriceItem {
  price: number;
  quantity: number;
}

function calculateOrderFinancials(items: PriceItem[]): {
  subtotal: number;
  shipping: number;
  total: number;
} {
  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = Math.round((rawSubtotal + Number.EPSILON) * 100) / 100;

  let shipping = 0;
  if (subtotal > 0) {
    shipping = subtotal >= 100 ? 0 : 5.99;
  }

  const rawTotal = subtotal + shipping;
  const total = Math.round((rawTotal + Number.EPSILON) * 100) / 100;

  return { subtotal, shipping, total };
}

describe("Pricing, Shipping Tiers & Currency Accuracy", () => {
  it("calculates accurate subtotal for single line items", () => {
    const items = [{ price: 45.5, quantity: 2 }];
    const financials = calculateOrderFinancials(items);
    expect(financials.subtotal).toBe(91.0);
  });

  it("applies $5.99 flat shipping when subtotal is below $100.00", () => {
    const items = [
      { price: 29.99, quantity: 1 },
      { price: 15.5, quantity: 2 },
    ];
    const financials = calculateOrderFinancials(items);
    expect(financials.subtotal).toBe(60.99);
    expect(financials.shipping).toBe(5.99);
    expect(financials.total).toBe(66.98);
  });

  it("applies $0.00 free shipping tier when subtotal exactly equals $100.00", () => {
    const items = [{ price: 50.0, quantity: 2 }];
    const financials = calculateOrderFinancials(items);
    expect(financials.subtotal).toBe(100.0);
    expect(financials.shipping).toBe(0.0);
    expect(financials.total).toBe(100.0);
  });

  it("applies $0.00 free shipping tier when subtotal exceeds $100.00", () => {
    const items = [{ price: 125.75, quantity: 1 }];
    const financials = calculateOrderFinancials(items);
    expect(financials.subtotal).toBe(125.75);
    expect(financials.shipping).toBe(0.0);
    expect(financials.total).toBe(125.75);
  });

  it("returns zero shipping and zero total for an empty cart", () => {
    const financials = calculateOrderFinancials([]);
    expect(financials.subtotal).toBe(0.0);
    expect(financials.shipping).toBe(0.0);
    expect(financials.total).toBe(0.0);
  });

  it("handles floating point arithmetic without precision leaks", () => {
    const items = [
      { price: 19.99, quantity: 3 },
      { price: 14.99, quantity: 2 },
    ];
    const financials = calculateOrderFinancials(items);
    expect(financials.subtotal).toBe(89.95);
    expect(financials.shipping).toBe(5.99);
    expect(financials.total).toBe(95.94);
  });
});
