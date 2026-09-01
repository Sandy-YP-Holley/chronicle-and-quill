import { describe, it, expect } from "vitest";

interface CartLineItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  stock: number;
}

function updateCartQuantity(
  item: CartLineItem,
  newQuantity: number
): { valid: boolean; quantity: number; error?: string } {
  if (!Number.isInteger(newQuantity)) {
    return { valid: false, quantity: item.quantity, error: "Quantity must be an integer." };
  }
  if (newQuantity < 0) {
    return { valid: false, quantity: item.quantity, error: "Quantity cannot be negative." };
  }
  if (newQuantity === 0) {
    return { valid: true, quantity: 0 };
  }
  if (item.stock <= 0) {
    return { valid: false, quantity: 0, error: "This volume is currently out of stock." };
  }
  if (newQuantity > item.stock) {
    return {
      valid: false,
      quantity: item.stock,
      error: `Cannot request ${newQuantity} copies. Only ${item.stock} available in The Stacks.`,
    };
  }
  return { valid: true, quantity: newQuantity };
}

function addToCart(
  cart: CartLineItem[],
  book: { id: string; title: string; price: number; stock: number },
  quantityToAdd: number
): { cart: CartLineItem[]; error?: string } {
  if (quantityToAdd <= 0 || !Number.isInteger(quantityToAdd)) {
    return { cart, error: "Quantity added must be a positive integer." };
  }
  if (book.stock <= 0) {
    return { cart, error: "Volume is out of stock." };
  }

  const existingIndex = cart.findIndex((i) => i.bookId === book.id);
  if (existingIndex >= 0) {
    const existing = cart[existingIndex];
    const totalDesired = existing.quantity + quantityToAdd;
    if (totalDesired > book.stock) {
      return {
        cart,
        error: `Only ${book.stock} available in stock. You already have ${existing.quantity} in cart.`,
      };
    }
    const updated = [...cart];
    updated[existingIndex] = { ...existing, quantity: totalDesired };
    return { cart: updated };
  }

  if (quantityToAdd > book.stock) {
    return {
      cart,
      error: `Only ${book.stock} available in stock.`,
    };
  }

  return {
    cart: [
      ...cart,
      {
        bookId: book.id,
        title: book.title,
        price: book.price,
        quantity: quantityToAdd,
        stock: book.stock,
      },
    ],
  };
}

describe("Cart Quantity & Boundary Conditions", () => {
  const sampleItem: CartLineItem = {
    bookId: "b1",
    title: "Meditations by Marcus Aurelius",
    price: 34.5,
    quantity: 1,
    stock: 5,
  };

  it("accepts valid positive integer quantities within stock limits", () => {
    const res = updateCartQuantity(sampleItem, 3);
    expect(res.valid).toBe(true);
    expect(res.quantity).toBe(3);
    expect(res.error).toBeUndefined();
  });

  it("rejects non-integer quantities such as 1.5 with descriptive error", () => {
    const res = updateCartQuantity(sampleItem, 1.5);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("must be an integer");
  });

  it("rejects negative quantities with descriptive error", () => {
    const res = updateCartQuantity(sampleItem, -2);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("cannot be negative");
  });

  it("allows quantity of 0 to trigger line-item deletion", () => {
    const res = updateCartQuantity(sampleItem, 0);
    expect(res.valid).toBe(true);
    expect(res.quantity).toBe(0);
  });

  it("rejects quantities exceeding upper stock limit", () => {
    const res = updateCartQuantity(sampleItem, 8);
    expect(res.valid).toBe(false);
    expect(res.quantity).toBe(5);
    expect(res.error).toContain("Only 5 available");
  });

  it("rejects adding an out-of-stock volume (stock = 0) to cart", () => {
    const outOfStockBook = {
      id: "b2",
      title: "Codex Gigas",
      price: 1200,
      stock: 0,
    };
    const result = addToCart([], outOfStockBook, 1);
    expect(result.cart.length).toBe(0);
    expect(result.error).toContain("out of stock");
  });

  it("merges quantity when existing book is added again, respecting stock ceiling", () => {
    const book = { id: "b3", title: "The Iliad", price: 28, stock: 3 };
    const step1 = addToCart([], book, 2);
    expect(step1.cart.length).toBe(1);
    expect(step1.cart[0].quantity).toBe(2);

    const step2 = addToCart(step1.cart, book, 1);
    expect(step2.cart[0].quantity).toBe(3);

    const step3 = addToCart(step2.cart, book, 1);
    expect(step3.error).toContain("Only 3 available");
    expect(step3.cart[0].quantity).toBe(3);
  });
});
