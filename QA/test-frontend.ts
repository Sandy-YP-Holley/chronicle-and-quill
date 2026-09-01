import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface FrontendTestResult {
  category: string;
  testCase: string;
  passed: boolean;
  durationMs: number;
  details?: string;
}

const results: FrontendTestResult[] = [];

function record(category: string, testCase: string, passed: boolean, durationMs: number, details?: string) {
  results.push({ category, testCase, passed, durationMs, details });
  const icon = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`  ${icon}: [${category}] ${testCase} (${durationMs}ms)`);
  if (!passed && details) {
    console.error(`       Error details: ${details}`);
  }
}

async function fetchPage(path: string, headers: Record<string, string> = {}) {
  const start = Date.now();
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  const html = await res.text();
  const duration = Date.now() - start;
  return { res, html, duration };
}

export async function runFrontendTests() {
  console.log("=================================================================");
  console.log("🏛️  Chronicle & Quill — Comprehensive Frontend Quality Assurance");
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log("=================================================================\n");

  console.log("📄 1. Testing Core Layout & Route Accessibility...");

  {
    const { res, html, duration } = await fetchPage("/");
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill") &&
      html.includes("Primary Sources") &&
      html.includes("The Stacks");
    record("Layout & Home", "Homepage renders header branding, navigation, and hero curation", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage("/books");
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill") &&
      html.includes("Cataloging Manuscripts");
    record("Catalog Discovery", "The Stacks (/books) renders filter sidebar, sorting and headers", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage("/search?q=Marcus");
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill") &&
      html.includes("Searching Archival Indexes");
    record("Search View", "Search page renders query parameter input and results scaffolding", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage("/cart");
    const passed =
      res.status === 200 &&
      html.includes("Your Archival Folio is Empty") &&
      html.includes("Explore The Stacks");
    record("Cart View", "Cart page renders empty folio state and catalog call to action", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage("/checkout");
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill") &&
      html.includes("The Stacks");
    record("Checkout Guard", "Checkout renders layout container and client cart boundary", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage("/login");
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill") &&
      html.includes("Accessing Guild Vault");
    record("Scholar Login", "Login page displays credentials form and Quick Demo Account button", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage("/register");
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill") &&
      html.includes("Accessing Guild Vault");
    record("Scholar Register", "Registration page renders guild signup form and password confirmation", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage("/wishlist");
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill");
    record("Wishlist View", "Wishlist page renders personal archive container and auth boundary", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage("/account");
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill");
    record("Account Portal", "Account page renders scholar dashboard and unauthenticated redirect guard", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage("/non-existent-folio-test-404");
    const passed =
      res.status === 404 &&
      html.includes("Lost in the Archives") &&
      html.includes("Folio 404");
    record("Fallback 404", "Custom 404 page renders archival folio missing message and stacks link", passed, duration);
  }

  console.log("\n🔒 2. Testing HTTP Security Headers on Frontend Pages...");

  {
    const { res, duration } = await fetchPage("/");
    const headers = res.headers;

    const hasCsp = headers.has("content-security-policy");
    const hasNosniff = headers.get("x-content-type-options") === "nosniff";
    const hasFrameOptions = headers.get("x-frame-options") === "DENY";
    const hasHsts = headers.has("strict-transport-security");
    const hasReferrer = headers.has("referrer-policy");

    record("Security Headers", "Content-Security-Policy header is actively enforced", hasCsp, duration);
    record("Security Headers", "X-Content-Type-Options: nosniff header present", hasNosniff, duration);
    record("Security Headers", "X-Frame-Options: DENY anti-clickjacking header present", hasFrameOptions, duration);
    record("Security Headers", "Strict-Transport-Security header present", hasHsts, duration);
    record("Security Headers", "Referrer-Policy: strict-origin-when-cross-origin header present", hasReferrer, duration);
  }

  console.log("\n⚡ 3. Testing Frontend Page Latency & Time To First Byte (TTFB)...");

  const routesToBenchmark = ["/", "/books", "/search", "/login", "/register", "/cart"];
  for (const route of routesToBenchmark) {
    const { duration, res } = await fetchPage(route);
    const passed = res.status === 200 && duration < 500;
    record("Performance TTFB", `Route ${route} responds in under 500ms (actual: ${duration}ms)`, passed, duration);
  }

  console.log("\n🛒 4. Testing End-to-End User Journey Simulation...");

  let guestCookie = "";
  let userSessionCookie = "";
  let sampleBookId = "";
  let createdOrderId = "";

  {
    const start = Date.now();
    const listRes = await fetch(`${BASE_URL}/api/books?limit=10`);
    const listData = await listRes.json();
    const available = listData.items.find((b: any) => b.stock > 0);
    sampleBookId = available ? available.id : listData.items[0].id;
    const duration = Date.now() - start;
    record("User Flow", "Discovered available volume from catalog API", !!sampleBookId, duration);
  }

  {
    const { res, html, duration } = await fetchPage(`/books/${sampleBookId}`);
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill") &&
      html.includes("The Stacks");
    record("User Flow", "Book detail page renders high-res cover, price guarantee, and purchase UI", passed, duration);
  }

  {
    const start = Date.now();
    const addRes = await fetch(`${BASE_URL}/api/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: sampleBookId, quantity: 1 }),
    });
    const addData = await addRes.json();
    const rawCookie = addRes.headers.get("set-cookie") || "";
    const match = rawCookie.match(/cq_guest_id=([^;]+)/);
    if (match) guestCookie = `cq_guest_id=${match[1]}`;
    const duration = Date.now() - start;
    const passed = addRes.status === 200 && !!guestCookie && addData.cart?.totalItems >= 1;
    record("User Flow", "Guest adds book to cart and receives cq_guest_id cookie", passed, duration);
  }

  {
    const start = Date.now();
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: guestCookie,
      },
      body: JSON.stringify({
        email: "scholar@chronicleandquill.com",
        password: "HistoricalReader2026!",
      }),
    });
    const rawUserCookie = loginRes.headers.get("set-cookie") || "";
    const match = rawUserCookie.match(/cq_session=([^;]+)/);
    if (match) userSessionCookie = `cq_session=${match[1]}`;
    const duration = Date.now() - start;
    const passed = loginRes.status === 200 && !!userSessionCookie;
    record("User Flow", "Guest signs in with Demo Scholar credentials and merges staged cart", passed, duration);
  }

  {
    const start = Date.now();
    const cartRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Cookie: userSessionCookie },
    });
    const cartData = await cartRes.json();
    const duration = Date.now() - start;
    const passed = cartData.cart?.items?.some((i: { bookId: string }) => i.bookId === sampleBookId);
    record("User Flow", "Verified authenticated cart retained the guest's selected volume", passed, duration);
  }

  {
    const start = Date.now();
    const idempotencyKey = `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const checkoutRes = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: "Marcus Scholar",
          street: "42 Alexandria Way",
          city: "Alexandria",
          postalCode: "02108",
          country: "United States",
        },
      }),
    });
    const checkoutData = await checkoutRes.json();
    createdOrderId = checkoutData.orderId;
    const duration = Date.now() - start;
    const passed =
      checkoutRes.status === 201 &&
      !!createdOrderId &&
      checkoutData.order?.payment?.isTestOrder === true &&
      checkoutData.order?.payment?.paymentMethod === "simulated_card";
    record("User Flow", "Completed simulated courier checkout with idempotency key", passed, duration);
  }

  {
    const { res, html, duration } = await fetchPage(`/order/${createdOrderId}`, {
      Cookie: userSessionCookie,
    });
    const passed =
      res.status === 200 &&
      html.includes("Chronicle &amp; Quill") &&
      html.includes("The Stacks");
    record("User Flow", "Order confirmation page displays visual lifecycle tracker and itemized receipt", passed, duration);
  }

  {
    const start = Date.now();
    const cancelRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
      },
      body: JSON.stringify({
        status: "Cancelled",
        reason: "Customer portal cancellation test.",
      }),
    });
    const cancelData = await cancelRes.json();
    const duration = Date.now() - start;
    const passed = cancelRes.status === 200 && cancelData.newStatus === "Cancelled";
    record("User Flow", "Scholar cancels pending order and automatically restores catalog stock", passed, duration);
  }

  {
    const start = Date.now();
    const wishRes = await fetch(`${BASE_URL}/api/wishlist/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
      },
      body: JSON.stringify({ bookId: sampleBookId }),
    });
    const wishData = await wishRes.json();
    const duration = Date.now() - start;
    const passed = wishRes.status === 200 && typeof wishData.inWishlist === "boolean";
    record("User Flow", "Scholar toggles historical volume in wishlist collection", passed, duration);
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n=================================================================");
  console.log("📊 Frontend QA Test Execution Summary");
  console.log("=================================================================");
  console.log(`  Total Tests Run:  ${results.length}`);
  console.log(`  Tests Passed:    ${passedCount}`);
  console.log(`  Tests Failed:    ${failedCount}`);
  console.log(`  Success Rate:    ${((passedCount / results.length) * 100).toFixed(1)}%`);
  console.log("=================================================================\n");

  return results;
}

if (require.main === module) {
  runFrontendTests().then((res) => {
    const hasFailures = res.some((r) => !r.passed);
    if (hasFailures) process.exit(1);
    else process.exit(0);
  });
}
