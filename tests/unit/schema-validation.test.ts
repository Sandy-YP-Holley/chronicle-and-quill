import { describe, it, expect } from "vitest";
import { CreateBookSchema } from "@/models/book";
import { CreateUserSchema } from "@/models/user";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/models/image";
import { escapeRegex } from "@/lib/validators";

describe("Zod Schema Validations & Boundary Conditions", () => {
  const validBookPayload = {
    title: "Meditations of Marcus Aurelius",
    authors: ["Marcus Aurelius"],
    period: "Antiquity" as const,
    subjects: ["Stoicism", "Roman Philosophy"],
    description: "Personal philosophical writings of the Roman Emperor Marcus Aurelius.",
    isbn: "978-0140449082",
    format: "Hardcover" as const,
    price: 38.5,
    stock: 7,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
  };

  it("successfully validates compliant rare book payload", () => {
    const res = CreateBookSchema.safeParse(validBookPayload);
    expect(res.success).toBe(true);
  });

  it("enforces minimum price boundary ($0.50)", () => {
    const invalidLow = { ...validBookPayload, price: 0.49 };
    const res = CreateBookSchema.safeParse(invalidLow);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("min: $0.50");
    }
  });

  it("enforces maximum price boundary ($50,000.00)", () => {
    const invalidHigh = { ...validBookPayload, price: 50000.01 };
    const res = CreateBookSchema.safeParse(invalidHigh);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("max: $50,000.00");
    }
  });

  it("rejects negative inventory stock count", () => {
    const invalidStock = { ...validBookPayload, stock: -1 };
    const res = CreateBookSchema.safeParse(invalidStock);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("greater than or equal to 0");
    }
  });

  it("rejects non-integer stock count", () => {
    const nonIntStock = { ...validBookPayload, stock: 3.5 };
    const res = CreateBookSchema.safeParse(nonIntStock);
    expect(res.success).toBe(false);
  });

  it("rejects invalid ISBN identifiers", () => {
    const invalidIsbn = { ...validBookPayload, isbn: "short" };
    const res = CreateBookSchema.safeParse(invalidIsbn);
    expect(res.success).toBe(false);
  });

  it("accepts local /api/images/[id] relative image endpoints", () => {
    const localCover = {
      ...validBookPayload,
      imageUrl: "/api/images/60d5ec49f1b2c82b8c8e4f1a",
    };
    const res = CreateBookSchema.safeParse(localCover);
    expect(res.success).toBe(true);
  });

  it("enforces user registration password complexity rules", () => {
    const invalidPassword = {
      email: "reader@chronicleandquill.com",
      password: "weak",
    };
    const res = CreateUserSchema.safeParse(invalidPassword);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("8 characters");
    }
  });

  it("strictly validates allowed archival image MIME formats", () => {
    expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/jpeg");
    expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/png");
    expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/webp");
    expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/avif");
    expect(ALLOWED_IMAGE_MIME_TYPES).not.toContain("application/pdf");
    expect(ALLOWED_IMAGE_MIME_TYPES).not.toContain("image/gif");
  });

  it("strictly validates 10 MB image size cap", () => {
    expect(MAX_IMAGE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    const validSize = 9.9 * 1024 * 1024;
    const oversized = 10.1 * 1024 * 1024;
    expect(validSize <= MAX_IMAGE_SIZE_BYTES).toBe(true);
    expect(oversized <= MAX_IMAGE_SIZE_BYTES).toBe(false);
  });

  it("sanitizes regex characters to neutralize MongoDB query operator injection", () => {
    const attackInput = ".*[$]test{1,2}?\\^";
    const sanitized = escapeRegex(attackInput);
    expect(sanitized).toBe("\\.\\*\\[\\$\\]test\\{1\\,2\\}\\?\\\\\\^");
  });
});
