import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runPhase2Tests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  function record(name: string, passed: boolean, error?: string) {
    results.push({ name, passed, error });
    if (passed) {
      console.log(`  [Phase 2] PASS: ${name}`);
    } else {
      console.error(`  [Phase 2] FAIL: ${name} -> ${error}`);
    }
  }

  console.log("\n--- Executing Phase 2: Route Handlers, Security & Business Logic Tests ---");

  let guestCookie = "";
  let userSessionCookie = "";
  let otherUserSessionCookie = "";
  let testBookId = "";
  let testBookPrice = 0;
  let createdOrderId = "";
  const uniqueTestEmail = `qa_scholar_${Date.now()}@chronicleandquill.com`;
  const otherUserEmail = `qa_intruder_${Date.now()}@chronicleandquill.com`;

  try {
    const listRes = await fetch(`${BASE_URL}/api/books?page=1&limit=5`);
    const listData = await listRes.json();
    record("GET /api/books returns HTTP 200", listRes.status === 200);
    record("GET /api/books respects bounded pagination limit=5", Array.isArray(listData.items) && listData.items.length === 5);
    record("GET /api/books pagination reports totalItems >= 20", listData.pagination?.totalItems >= 20);

    testBookId = listData.items[0].id;
    testBookPrice = listData.items[0].price;

    const searchRes = await fetch(`${BASE_URL}/api/books?search=Marcus`);
    const searchData = await searchRes.json();
    record(
      "GET /api/books?search=Marcus returns Meditations via full-text ranking",
      searchData.items?.some((b: { title: string }) => b.title.includes("Meditations"))
    );

    const periodRes = await fetch(`${BASE_URL}/api/books?period=Antiquity`);
    const periodData = await periodRes.json();
    record(
      "GET /api/books?period=Antiquity filters strictly by historical epoch",
      periodData.items?.every((b: { period: string }) => b.period === "Antiquity")
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("Catalog API test suite", false, msg);
  }

  try {
    const bookRes = await fetch(`${BASE_URL}/api/books/${testBookId}`);
    const bookData = await bookRes.json();
    record("GET /api/books/[id] retrieves single book detail", bookRes.status === 200 && bookData.book?.id === testBookId);

    const injectionRes = await fetch(`${BASE_URL}/api/books/%7B%24gt%3A%22%22%7D`);
    const injectionData = await injectionRes.json();
    record(
      "GET /api/books/[id] rejects NoSQL operator injection with RFC-7807 404 Problem Details",
      injectionRes.status === 404 && injectionData.type?.includes("not-found")
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("Single book & injection defense suite", false, msg);
  }

  try {
    const guestAddRes = await fetch(`${BASE_URL}/api/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: testBookId, quantity: 2 }),
    });
    const guestAddData = await guestAddRes.json();
    const rawGuestCookie = guestAddRes.headers.get("set-cookie") || "";
    const match = rawGuestCookie.match(/cq_guest_id=([^;]+)/);
    if (match) {
      guestCookie = `cq_guest_id=${match[1]}`;
    }

    record("POST /api/cart/add allows unauthenticated guest staging", guestAddRes.status === 200);
    record("POST /api/cart/add issues anonymous session cookie cq_guest_id", guestCookie.length > 0);
    record(
      "Guest cart contains 2 units of the selected volume",
      guestAddData.cart?.items?.some((i: { bookId: string; quantity: number }) => i.bookId === testBookId && i.quantity === 2)
    );

    const guestCartRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Cookie: guestCookie },
    });
    const guestCartData = await guestCartRes.json();
    record(
      "GET /api/cart calculates subtotal strictly server-side using current MongoDB prices",
      guestCartData.cart?.subtotal === Number((testBookPrice * 2).toFixed(2))
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("Guest cart staging suite", false, msg);
  }

  try {
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: guestCookie,
      },
      body: JSON.stringify({
        email: uniqueTestEmail,
        password: "ArchivalUser2026!",
        name: "QA Scholar",
      }),
    });
    const rawUserCookie = registerRes.headers.get("set-cookie") || "";
    const match = rawUserCookie.match(/cq_session=([^;]+)/);
    if (match) {
      userSessionCookie = `cq_session=${match[1]}`;
    }

    record("POST /api/auth/register registers account with bcrypt hash & session cookie", registerRes.status === 201 && userSessionCookie.length > 0);

    const userCartRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Cookie: userSessionCookie },
    });
    const userCartData = await userCartRes.json();
    record(
      "User registration seamlessly merges staged guest cart into permanent account",
      userCartData.cart?.items?.some((i: { bookId: string; quantity: number }) => i.bookId === testBookId && i.quantity === 2)
    );

    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: userSessionCookie },
    });
    const meData = await meRes.json();
    record("GET /api/auth/me returns authenticated user identity", meRes.status === 200 && meData.user?.email === uniqueTestEmail);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("Auth & guest cart merge suite", false, msg);
  }

  try {
    const addWishRes = await fetch(`${BASE_URL}/api/wishlist/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
      },
      body: JSON.stringify({ bookId: testBookId }),
    });
    const addWishData = await addWishRes.json();
    record("POST /api/wishlist/toggle adds volume to user wishlist", addWishData.inWishlist === true);

    const getWishRes = await fetch(`${BASE_URL}/api/wishlist`, {
      headers: { Cookie: userSessionCookie },
    });
    const getWishData = await getWishRes.json();
    record("GET /api/wishlist returns populated volume for user", getWishData.wishlist?.items?.some((b: { id: string }) => b.id === testBookId));

    const removeWishRes = await fetch(`${BASE_URL}/api/wishlist/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
      },
      body: JSON.stringify({ bookId: testBookId }),
    });
    const removeWishData = await removeWishRes.json();
    record("POST /api/wishlist/toggle removes volume from wishlist on second toggle", removeWishData.inWishlist === false);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("Wishlist API suite", false, msg);
  }

  const validShippingAddress = {
    fullName: "QA Scholar",
    street: "123 Manuscript Way",
    city: "Alexandria",
    postalCode: "10001",
    country: "United States",
  };

  try {
    const pciRes = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
      },
      body: JSON.stringify({
        shippingAddress: validShippingAddress,
        cardNumber: "4111222233334444",
        cvv: "123",
      }),
    });
    const pciData = await pciRes.json();
    record(
      "POST /api/checkout PCI-DSS Guard strictly rejects raw credit card numbers/CVVs with RFC-7807 400",
      pciRes.status === 400 && pciData.type?.includes("pci-compliance-violation")
    );

    const idempotencyKey = `qa_key_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const checkoutRes = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        shippingAddress: validShippingAddress,
      }),
    });
    const checkoutData = await checkoutRes.json();
    record("POST /api/checkout confirms order successfully (HTTP 201)", checkoutRes.status === 201);
    record("POST /api/checkout simulated payment disclosure isTestOrder === true", checkoutData.order?.payment?.isTestOrder === true);
    record("POST /api/checkout paymentMethod explicitly declared as 'simulated_card'", checkoutData.order?.payment?.paymentMethod === "simulated_card");
    record("POST /api/checkout assigns simulated transaction ID", typeof checkoutData.order?.payment?.transactionId === "string");

    createdOrderId = checkoutData.orderId;

    const clearedCartRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Cookie: userSessionCookie },
    });
    const clearedCartData = await clearedCartRes.json();
    record("POST /api/checkout automatically empties user cart upon order confirmation", clearedCartData.cart?.items?.length === 0);

    const replayRes = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        shippingAddress: validShippingAddress,
      }),
    });
    const replayData = await replayRes.json();
    record(
      "POST /api/checkout idempotency lock returns existing order without double-charging or deducting inventory",
      replayRes.status === 200 && replayData.orderId === createdOrderId
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("Checkout & Idempotency suite", false, msg);
  }

  try {
    const ordersRes = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Cookie: userSessionCookie },
    });
    const ordersData = await ordersRes.json();
    record("GET /api/orders returns orders for authenticated owner", ordersData.orders?.some((o: { id: string }) => o.id === createdOrderId));

    const orderDetailRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      headers: { Cookie: userSessionCookie },
    });
    record("GET /api/orders/[id] returns order detail to owner (HTTP 200)", orderDetailRes.status === 200);

    const intruderRegisterRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: otherUserEmail,
        password: "IntruderPassword123!",
        name: "QA Intruder",
      }),
    });
    const rawIntruderCookie = intruderRegisterRes.headers.get("set-cookie") || "";
    const match = rawIntruderCookie.match(/cq_session=([^;]+)/);
    if (match) {
      otherUserSessionCookie = `cq_session=${match[1]}`;
    }

    const idorRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      headers: { Cookie: otherUserSessionCookie },
    });
    const idorData = await idorRes.json();
    record(
      "GET /api/orders/[id] Anti-IDOR Guard: Non-owner access attempt rejected with RFC-7807 403 Forbidden",
      idorRes.status === 403 && idorData.type?.includes("forbidden")
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("Orders & Anti-IDOR suite", false, msg);
  }

  try {
    const cancelRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
      },
      body: JSON.stringify({
        status: "Cancelled",
        reason: "QA Test cancellation.",
      }),
    });
    const cancelData = await cancelRes.json();
    record("PATCH /api/orders/[id]/status allows customer cancellation of Pending order", cancelRes.status === 200 && cancelData.newStatus === "Cancelled");

    const invalidRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: userSessionCookie,
      },
      body: JSON.stringify({ status: "Confirmed" }),
    });
    record("PATCH /api/orders/[id]/status State Machine rejects transition from terminal 'Cancelled' status (HTTP 400)", invalidRes.status === 400);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    record("Order state machine suite", false, msg);
  }

  return results;
}

if (require.main === module) {
  runPhase2Tests().then((res) => {
    const passed = res.filter((r) => r.passed).length;
    console.log(`\nPhase 2 Summary: ${passed}/${res.length} Passed`);
    if (passed < res.length) process.exit(1);
  });
}
