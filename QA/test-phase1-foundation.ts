import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { UserSchema, CreateUserSchema } from "../src/models/user";
import { BookSchema, CreateBookSchema } from "../src/models/book";
import { CartSchema } from "../src/models/cart";
import { WishlistSchema } from "../src/models/wishlist";
import { OrderSchema } from "../src/models/order";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../src/lib/auth";
import { formatCurrency, formatDate, getPeriodBadge } from "../src/lib/formatters";
import { parseObjectId, containsRawCreditCardData, escapeRegex } from "../src/lib/validators";

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runPhase1Tests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  function record(name: string, passed: boolean, error?: string) {
    results.push({ name, passed, error });
    if (passed) {
      console.log(`  [Phase 1] PASS: ${name}`);
    } else {
      console.error(`  [Phase 1] FAIL: ${name} -> ${error}`);
    }
  }

  console.log("\n--- Executing Phase 1: Foundation, Security & Model Tests ---");

  try {
    const { getDatabase, getCollection } = await import("../src/lib/mongodb");
    const db = await getDatabase();
    const booksCol = await getCollection("books");
    const bookCount = await booksCol.countDocuments();
    record("MongoDB Atlas connection & pool initialization", !!db && bookCount >= 22);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("MongoDB Atlas connection & pool initialization", false, msg);
  }

  try {
    const validUser = CreateUserSchema.safeParse({
      email: "scholar@chronicleandquill.com",
      password: "StrongPassword123!",
      name: "Marcus Scholar",
    });
    record("UserSchema validates well-formed user payload", validUser.success);

    const invalidEmail = CreateUserSchema.safeParse({
      email: "not-an-email",
      password: "StrongPassword123!",
    });
    record("UserSchema rejects malformed email", !invalidEmail.success);

    const weakPassword = CreateUserSchema.safeParse({
      email: "user@example.com",
      password: "weak",
    });
    record("UserSchema enforces password strength (min 8 chars, uppercase, number)", !weakPassword.success);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("UserSchema validation suite", false, msg);
  }

  try {
    const validBook = BookSchema.safeParse({
      title: "The Peloponnesian War",
      authors: ["Thucydides"],
      period: "Antiquity",
      subjects: ["Classical Greece", "Military Strategy"],
      description: "A foundational text of scientific historiography.",
      isbn: "978-0140440393",
      format: "Hardcover",
      price: 28.75,
      stock: 12,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
      pages: 656,
      publisher: "Archival Classics",
      publicationYear: -411,
      featured: true,
      rating: 4.8,
    });
    record("BookSchema validates authentic historical book", validBook.success);

    const invalidPeriod = CreateBookSchema.safeParse({
      title: "Fake Book",
      authors: ["Author"],
      period: "Space Age",
      subjects: ["SciFi"],
      description: "Invalid period text here.",
      isbn: "978-1234567890",
      format: "Hardcover",
      price: 20,
      stock: 5,
      imageUrl: "https://example.com/cover.jpg",
    });
    record("BookSchema rejects invalid historical epoch enum", !invalidPeriod.success);

    const negativeStock = CreateBookSchema.safeParse({
      title: "Negative Stock Book",
      authors: ["Author"],
      period: "Medieval",
      subjects: ["History"],
      description: "Detailed description for book.",
      isbn: "978-1234567890",
      format: "Paperback",
      price: 20,
      stock: -5,
      imageUrl: "https://example.com/cover.jpg",
    });
    record("BookSchema enforces non-negative stock constraint", !negativeStock.success);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("BookSchema validation suite", false, msg);
  }

  try {
    const validCart = CartSchema.safeParse({
      userId: "user_123",
      items: [{ bookId: "64b8f01234567890abcdef12", quantity: 2 }],
    });
    record("CartSchema validates cart with user identity", validCart.success);

    const guestCart = CartSchema.safeParse({
      sessionId: "guest_uuid_12345",
      items: [{ bookId: "64b8f01234567890abcdef12", quantity: 1 }],
    });
    record("CartSchema validates cart with guest session ID", guestCart.success);

    const headlessCart = CartSchema.safeParse({
      items: [{ bookId: "64b8f01234567890abcdef12", quantity: 1 }],
    });
    record("CartSchema rejects cart lacking both userId and sessionId", !headlessCart.success);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("CartSchema validation suite", false, msg);
  }

  try {
    const validWishlist = WishlistSchema.safeParse({
      userId: "user_123",
      bookIds: ["64b8f01234567890abcdef12"],
    });
    record("WishlistSchema validates user wishlist", validWishlist.success);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("WishlistSchema validation suite", false, msg);
  }

  try {
    const validOrder = OrderSchema.safeParse({
      ownerId: "user_123",
      items: [
        {
          bookId: "64b8f01234567890abcdef12",
          title: "Meditations",
          price: 34.50,
          quantity: 1,
        },
      ],
      subtotal: 34.50,
      shipping: 5.99,
      total: 40.49,
      shippingAddress: {
        fullName: "Marcus Aurelius",
        street: "Palatine Hill",
        city: "Rome",
        postalCode: "00100",
        country: "Italy",
      },
      status: "Pending",
    });
    record("OrderSchema validates immutable order snapshot", validOrder.success);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("OrderSchema validation suite", false, msg);
  }

  try {
    const password = "ArchivalSecretPassword2026!";
    const hash = await hashPassword(password);
    record("bcryptjs generates salt & hash", typeof hash === "string" && hash.startsWith("$2"));

    const isMatch = await verifyPassword(password, hash);
    record("bcryptjs validates correct password match", isMatch === true);

    const isWrongMatch = await verifyPassword("WrongPassword123!", hash);
    record("bcryptjs rejects incorrect password match", isWrongMatch === false);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("bcryptjs password hashing suite", false, msg);
  }

  try {
    const payload = {
      userId: "user_test_99",
      email: "scholar@chronicleandquill.com",
      role: "customer" as const,
      name: "Scholar",
    };
    const token = await createSessionToken(payload);
    record("jose generates signed JWT session token", typeof token === "string" && token.split(".").length === 3);

    const verified = await verifySessionToken(token);
    record("jose verifies session token and preserves payload identity", verified?.userId === payload.userId && verified?.email === payload.email);

    const tamperedToken = token.slice(0, -5) + "abcde";
    const invalidVerification = await verifySessionToken(tamperedToken);
    record("jose rejects tampered session token signature", invalidVerification === null);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("jose session authentication suite", false, msg);
  }

  try {
    const validId = parseObjectId("64b8f01234567890abcdef12");
    record("parseObjectId parses 24-character hexadecimal ObjectId", validId !== null && validId.toString() === "64b8f01234567890abcdef12");

    const injectionPayload = parseObjectId("{ $gt: '' }");
    record("parseObjectId rejects NoSQL operator injection string", injectionPayload === null);

    const shortId = parseObjectId("12345");
    record("parseObjectId rejects short non-hex string", shortId === null);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("ObjectId sanitization suite", false, msg);
  }

  try {
    const cleanPayload = { shippingAddress: { fullName: "Marcus" } };
    record("containsRawCreditCardData passes safe payload", containsRawCreditCardData(cleanPayload) === false);

    const cardPayload = { cardNumber: "4111222233334444" };
    record("containsRawCreditCardData detects 'cardNumber' key", containsRawCreditCardData(cardPayload) === true);

    const cvvPayload = { cvv: "123" };
    record("containsRawCreditCardData detects 'cvv' key", containsRawCreditCardData(cvvPayload) === true);

    const nestedCard = { payment: { details: { pan: "5555666677778888" } } };
    record("containsRawCreditCardData detects deeply nested raw card numbers", containsRawCreditCardData(nestedCard) === true);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("PCI-DSS credit card detector suite", false, msg);
  }

  try {
    record("formatCurrency outputs formatted USD string", formatCurrency(34.5) === "$34.50");
    record("formatCurrency outputs double decimals for whole amounts", formatCurrency(50) === "$50.00");

    const badge = getPeriodBadge("Antiquity");
    record("getPeriodBadge provides styled epoch configuration", typeof badge.label === "string" && badge.bgClass.includes("amber"));

    const escaped = escapeRegex("Marcus (Emperor)");
    record("escapeRegex neutralizes parentheses and special characters", escaped === "Marcus\\ \\(Emperor\\)");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("Formatters and helpers suite", false, msg);
  }

  return results;
}
