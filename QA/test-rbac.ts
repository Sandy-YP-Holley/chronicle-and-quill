import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { getCollection } from "../src/lib/mongodb";
import { parseObjectId } from "../src/lib/validators";

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

export async function runRBACTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  async function test(name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        suite: "RBAC Multi-Role & Administration",
        name,
        passed: true,
        durationMs: Date.now() - start,
      });
      console.log(`  ✓ ${name}`);
    } catch (err: any) {
      results.push({
        suite: "RBAC Multi-Role & Administration",
        name,
        passed: false,
        error: err.message || String(err),
        durationMs: Date.now() - start,
      });
      console.error(`  ✗ ${name}: ${err.message}`);
    }
  }

  console.log("\n--- Executing RBAC Multi-Role & Administration QA Suite ---");

  let scholarCookie = "";
  let sellerCookie = "";
  let adminCookie = "";
  let newlyElevatedCookie = "";
  let testBookId = "";
  let testOrderedBookId = "";
  let testOrderId = "";

  await test("Unauthenticated requests to seller endpoints return 401 Unauthorized", async () => {
    const getRes1 = await fetch(`${BASE_URL}/api/seller/books`);
    if (getRes1.status !== 401) throw new Error(`Expected 401 for /api/seller/books, got ${getRes1.status}`);

    const getRes2 = await fetch(`${BASE_URL}/api/seller/orders`);
    if (getRes2.status !== 401) throw new Error(`Expected 401 for /api/seller/orders, got ${getRes2.status}`);

    const postRes = await fetch(`${BASE_URL}/api/seller/onboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerName: "Test Dealership" }),
    });
    if (postRes.status !== 401) throw new Error(`Expected 401 for POST /api/seller/onboard, got ${postRes.status}`);
  });

  await test("Unauthenticated requests to admin endpoints return 401 Unauthorized", async () => {
    const endpoints = [
      "/api/admin/metrics",
      "/api/admin/orders",
      "/api/admin/books",
      "/api/admin/users",
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep}`);
      if (res.status !== 401) {
        throw new Error(`Expected 401 for unauthenticated ${ep}, got ${res.status}`);
      }
    }
  });

  await test("Sign in as Scholar (buyer role) and obtain session cookie", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "scholar@chronicleandquill.com",
        password: "HistoricalReader2026!",
      }),
    });

    if (!res.ok) throw new Error(`Scholar login failed with status ${res.status}`);
    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) throw new Error("No set-cookie returned on login");
    scholarCookie = setCookie.split(";")[0];
  });

  await test("Sign in as Seller (seller role) and obtain session cookie", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "seller@chronicleandquill.com",
        password: "HistoricalReader2026!",
      }),
    });

    if (!res.ok) throw new Error(`Seller login failed with status ${res.status}`);
    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) throw new Error("No set-cookie returned on login");
    sellerCookie = setCookie.split(";")[0];
  });

  await test("Sign in as Admin (admin role) and obtain session cookie", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@chronicleandquill.com",
        password: "HistoricalReader2026!",
      }),
    });

    if (!res.ok) throw new Error(`Admin login failed with status ${res.status}`);
    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) throw new Error("No set-cookie returned on login");
    adminCookie = setCookie.split(";")[0];
  });

  await test("Scholar Buyer is forbidden (403) from accessing seller endpoints", async () => {
    const res = await fetch(`${BASE_URL}/api/seller/books`, {
      headers: { Cookie: scholarCookie },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for buyer accessing seller/books, got ${res.status}`);
    }
  });

  await test("Scholar Buyer is forbidden (403) from accessing admin metrics", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Cookie: scholarCookie },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for buyer accessing admin/metrics, got ${res.status}`);
    }
  });

  await test("Scholar Buyer is forbidden (403) from accessing admin user directory", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: scholarCookie },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for buyer accessing admin/users, got ${res.status}`);
    }
  });

  await test("Register new buyer account and elevate to seller via onboarding", async () => {
    const uniqueEmail = `scholar_elevate_${Date.now()}@chronicleandquill.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: "HistoricalReader2026!",
        name: "Elevating Scholar",
      }),
    });

    if (!regRes.ok) throw new Error(`Registration failed with status ${regRes.status}`);
    const regCookie = regRes.headers.get("set-cookie")!.split(";")[0];

    const meResBefore = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: regCookie },
    });
    const meDataBefore = await meResBefore.json();
    if (meDataBefore.user.role !== "buyer") {
      throw new Error(`Expected initial role 'buyer', got '${meDataBefore.user.role}'`);
    }

    const onboardRes = await fetch(`${BASE_URL}/api/seller/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: regCookie,
      },
      body: JSON.stringify({
        sellerName: "Constantinople Imperial Bindery",
        specialtyEra: "Medieval Era (500 – 1500 CE)",
        sellerBio: "Illuminated manuscripts and Byzantine theological scrolls.",
      }),
    });

    if (!onboardRes.ok) throw new Error(`Onboarding failed with status ${onboardRes.status}`);
    const elevatedSetCookie = onboardRes.headers.get("set-cookie");
    if (elevatedSetCookie) {
      newlyElevatedCookie = elevatedSetCookie.split(";")[0];
    } else {
      newlyElevatedCookie = regCookie;
    }

    const meResAfter = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: newlyElevatedCookie },
    });
    const meDataAfter = await meResAfter.json();
    if (meDataAfter.user.role !== "seller") {
      throw new Error(`Expected upgraded role 'seller', got '${meDataAfter.user.role}'`);
    }
    if (meDataAfter.user.sellerName !== "Constantinople Imperial Bindery") {
      throw new Error(`Expected sellerName 'Constantinople Imperial Bindery', got '${meDataAfter.user.sellerName}'`);
    }
  });

  await test("Elevated seller can catalog a new folio in The Stacks", async () => {
    const res = await fetch(`${BASE_URL}/api/seller/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: newlyElevatedCookie,
      },
      body: JSON.stringify({
        title: "Chronographia of Michael Psellos",
        authors: ["Michael Psellos"],
        period: "Medieval",
        subjects: ["Byzantine History", "Court Politics", "Greek Manuscripts"],
        isbn: `978-${Date.now().toString().slice(-10)}`,
        format: "Leather-bound",
        price: 78.50,
        stock: 6,
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        description: "An authentic archival translation of 11th-century Byzantine imperial memoirs.",
      }),
    });

    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Failed to create book: ${err.detail || res.status}`);
    }

    const data = await res.json();
    testBookId = data.book.id;
    if (!testBookId) throw new Error("No book ID returned from seller creation");
  });

  await test("Anti-BOLA: Another seller is rejected (403) from modifying or deleting someone else's book", async () => {
    const patchRes = await fetch(`${BASE_URL}/api/seller/books/${testBookId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sellerCookie,
      },
      body: JSON.stringify({ price: 10.00 }),
    });

    if (patchRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for anti-BOLA PATCH, got ${patchRes.status}`);
    }

    const deleteRes = await fetch(`${BASE_URL}/api/seller/books/${testBookId}`, {
      method: "DELETE",
      headers: { Cookie: sellerCookie },
    });

    if (deleteRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for anti-BOLA DELETE, got ${deleteRes.status}`);
    }
  });

  await test("Guardrail 1: GET /api/admin/users explicitly omits password hashes", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: adminCookie },
    });

    if (!res.ok) throw new Error(`Failed to fetch admin users: status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.users) || data.users.length === 0) {
      throw new Error("Expected non-empty users array in admin directory");
    }

    for (const u of data.users) {
      if ("passwordHash" in u || "password" in u) {
        throw new Error(`Security violation: User ${u.email} exposed password credentials!`);
      }
    }
  });

  await test("Create an active order containing an archival volume for lifecycle testing", async () => {
    const bookCreateRes = await fetch(`${BASE_URL}/api/seller/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sellerCookie,
      },
      body: JSON.stringify({
        title: `Lifecycle Test Manuscript ${Date.now()}`,
        authors: ["Archival Test Author"],
        period: "Medieval",
        subjects: ["Test Subject"],
        isbn: `978-${Date.now().toString().slice(-10)}`,
        format: "Hardcover",
        price: 35.00,
        stock: 10,
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        description: "A test volume specifically created for order lifecycle and soft-delist testing.",
      }),
    });

    if (!bookCreateRes.ok) throw new Error("Failed to create test book for order lifecycle");
    const bookCreateData = await bookCreateRes.json();
    testOrderedBookId = bookCreateData.book.id;

    const cartAddRes = await fetch(`${BASE_URL}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: scholarCookie,
      },
      body: JSON.stringify({ bookId: testOrderedBookId, quantity: 1 }),
    });
    if (!cartAddRes.ok) throw new Error("Failed to add book to cart");

    const checkoutRes = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: scholarCookie,
        "Idempotency-Key": `idemp_rbac_${Date.now()}_${Math.random()}`,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: "Hieronymus Scholar",
          street: "Via Sacra 12",
          city: "Rome",
          postalCode: "00186",
          country: "Italy",
        },
        paymentDetails: {
          mockProviderToken: "tok_simulated_parchment_pass",
        },
      }),
    });

    if (!checkoutRes.ok) {
      const err = await checkoutRes.json();
      throw new Error(`Checkout failed: ${err.detail || checkoutRes.status}`);
    }

    const checkoutData = await checkoutRes.json();
    testOrderId = checkoutData.orderId || checkoutData.order?.id;
  });

  await test("Guardrail 2: Admin transitions order to 'Delivered' and terminal state lock rejects further edits", async () => {
    const advanceRes = await fetch(`${BASE_URL}/api/admin/orders/${testOrderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ status: "Delivered" }),
    });

    if (!advanceRes.ok) {
      const err = await advanceRes.json();
      throw new Error(`Failed to advance order to Delivered: status ${advanceRes.status} - ${err.detail || JSON.stringify(err)}`);
    }

    const illegalTransitionRes = await fetch(`${BASE_URL}/api/admin/orders/${testOrderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ status: "Pending" }),
    });

    if (illegalTransitionRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for terminal state violation, got ${illegalTransitionRes.status}`);
    }

    const illegalData = await illegalTransitionRes.json();
    if (!illegalData.title?.includes("Terminal State Violation")) {
      throw new Error(`Expected error title 'Terminal State Violation', got '${illegalData.title}'`);
    }
  });

  await test("Guardrail 3: Deleting a book with historical orders soft-delists rather than purges document", async () => {
    const booksCollection = await getCollection("books");
    const bookBefore = await booksCollection.findOne({ _id: parseObjectId(testOrderedBookId)! });
    if (!bookBefore) throw new Error("Ordered book not found in database before soft-delist check");

    await booksCollection.updateOne(
      { _id: parseObjectId(testOrderedBookId)! },
      { $set: { sellerId: (await booksCollection.findOne({}))?.sellerId || "mock_seller_id" } }
    );

    const deleteRes = await fetch(`${BASE_URL}/api/admin/books/${testOrderedBookId}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });

    if (!deleteRes.ok) throw new Error(`Delist endpoint returned status ${deleteRes.status}`);
    const deleteData = await deleteRes.json();

    if (!deleteData.delisted || deleteData.purged) {
      throw new Error(`Expected delisted=true and purged=false, got: ${JSON.stringify(deleteData)}`);
    }

    const bookAfter = await booksCollection.findOne({ _id: parseObjectId(testOrderedBookId)! });
    if (!bookAfter) {
      throw new Error("Referential integrity failure: Book document was completely purged despite having historical orders!");
    }
    if (bookAfter.isDelisted !== true) {
      throw new Error(`Expected isDelisted=true on soft-delisted book, got '${bookAfter.isDelisted}'`);
    }

    const publicCatalogRes = await fetch(`${BASE_URL}/api/books`);
    const publicCatalogData = await publicCatalogRes.json();
    const isPublic = publicCatalogData.items.some((b: any) => b.id === testOrderedBookId);
    if (isPublic) {
      throw new Error("Soft-delisted book still appears in public catalog!");
    }
  });

  await test("Un-ordered book deletion permanently purges the document", async () => {
    const booksCollection = await getCollection("books");
    const deleteRes = await fetch(`${BASE_URL}/api/seller/books/${testBookId}`, {
      method: "DELETE",
      headers: { Cookie: newlyElevatedCookie },
    });

    if (!deleteRes.ok) throw new Error(`Delete endpoint returned status ${deleteRes.status}`);
    const deleteData = await deleteRes.json();

    if (!deleteData.purged) {
      throw new Error(`Expected un-ordered book to be purged=true, got: ${JSON.stringify(deleteData)}`);
    }

    const bookDoc = await booksCollection.findOne({ _id: parseObjectId(testBookId)! });
    if (bookDoc) {
      throw new Error("Un-ordered book was not purged from MongoDB!");
    }
  });

  return results;
}
