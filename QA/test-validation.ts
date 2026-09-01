import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

export async function runValidationTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  async function test(name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        suite: "RFC-7807 Validation & Error Handling",
        name,
        passed: true,
        durationMs: Date.now() - start,
      });
      console.log(`  ✓ ${name}`);
    } catch (err: any) {
      results.push({
        suite: "RFC-7807 Validation & Error Handling",
        name,
        passed: false,
        error: err.message || String(err),
        durationMs: Date.now() - start,
      });
      console.error(`  ✗ ${name}: ${err.message}`);
    }
  }

  console.log("\n--- Executing RFC-7807 Validation & Form Error Handling QA Suite ---");

  let sellerCookie = "";
  let scholarCookie = "";
  let uploadedImageUrl = "";

  await test("Obtain authentication cookies for Seller and Scholar accounts", async () => {
    const sellerRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "seller@chronicleandquill.com",
        password: "HistoricalReader2026!",
      }),
    });
    if (!sellerRes.ok) throw new Error("Failed to authenticate demo seller");
    sellerCookie = (sellerRes.headers.get("set-cookie") || "").split(";")[0];

    const scholarRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "scholar@chronicleandquill.com",
        password: "HistoricalReader2026!",
      }),
    });
    if (!scholarRes.ok) throw new Error("Failed to authenticate demo scholar");
    scholarCookie = (scholarRes.headers.get("set-cookie") || "").split(";")[0];
  });

  await test("User registration rejects invalid email & short password with RFC-7807 422 problem details", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "not-an-archival-email",
        password: "short",
      }),
    });

    if (res.status !== 422) {
      throw new Error(`Expected HTTP 422, received ${res.status}`);
    }

    const data = await res.json();

    if (data.type !== "https://chronicleandquill.com/errors/validation-failed") {
      throw new Error(`Expected RFC-7807 type URI, received ${data.type}`);
    }
    if (data.title !== "Unprocessable Entity") {
      throw new Error(`Expected title 'Unprocessable Entity', received ${data.title}`);
    }
    if (!data.detail || !data.detail.includes("Validation failed on [")) {
      throw new Error(`Expected structured detail string, received ${data.detail}`);
    }
    if (!data.errors || typeof data.errors !== "object") {
      throw new Error("Expected errors dictionary mapping field paths");
    }
    if (!data.errors.email || !data.errors.email[0].includes("valid email address")) {
      throw new Error(`Expected instructional email error, received ${JSON.stringify(data.errors.email)}`);
    }
    if (!data.errors.password || !data.errors.password[0].includes("8 characters")) {
      throw new Error(`Expected instructional password error, received ${JSON.stringify(data.errors.password)}`);
    }
  });

  await test("User login rejects empty credentials with HTTP 422 and exact field errors", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "invalid-email-format",
        password: "",
      }),
    });

    if (res.status !== 422) {
      throw new Error(`Expected HTTP 422 for malformed login, received ${res.status}`);
    }

    const data = await res.json();
    if (!data.errors?.email || !data.errors?.password) {
      throw new Error(`Expected both email and password field errors, received ${JSON.stringify(data.errors)}`);
    }
  });

  await test("Seller manuscript creation rejects negative price, negative stock, and invalid epoch with specific bounds", async () => {
    const res = await fetch(`${BASE_URL}/api/seller/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sellerCookie,
      },
      body: JSON.stringify({
        title: "T",
        authors: [""],
        period: "Space Age",
        subjects: [],
        description: "Short",
        isbn: "123",
        format: "Digital PDF",
        price: -15.5,
        stock: -3,
        imageUrl: "not-a-valid-url",
      }),
    });

    if (res.status !== 422) {
      throw new Error(`Expected HTTP 422 for invalid manuscript, received ${res.status}`);
    }

    const data = await res.json();

    if (!data.errors?.price || !data.errors.price[0].includes("min: $0.50")) {
      throw new Error(`Expected price bounds error, received ${JSON.stringify(data.errors?.price)}`);
    }
    if (!data.errors?.stock || !data.errors.stock[0].includes("greater than or equal to 0")) {
      throw new Error(`Expected stock non-negative error, received ${JSON.stringify(data.errors?.stock)}`);
    }
    if (!data.errors?.period || !data.errors.period[0].includes("Historical epoch must be one of")) {
      throw new Error(`Expected period enum guidance, received ${JSON.stringify(data.errors?.period)}`);
    }
    if (!data.errors?.isbn || !data.errors.isbn[0].includes("standard book identifier")) {
      throw new Error(`Expected ISBN format guidance, received ${JSON.stringify(data.errors?.isbn)}`);
    }
    if (!data.errors?.title || !data.errors.title[0].includes("between 2 and 200 characters")) {
      throw new Error(`Expected title length guidance, received ${JSON.stringify(data.errors?.title)}`);
    }
  });

  await test("Checkout rejects invalid shipping address with nested field paths (e.g. shippingAddress.postalCode)", async () => {
    const res = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: scholarCookie,
        "Idempotency-Key": `idemp_val_${Date.now()}`,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: "A",
          street: "Way",
          city: "X",
          postalCode: "1",
          country: "C",
        },
      }),
    });

    if (res.status !== 422) {
      throw new Error(`Expected HTTP 422 for invalid shipping address, received ${res.status}`);
    }

    const data = await res.json();

    if (!data.errors?.["shippingAddress.fullName"]) {
      throw new Error(`Expected shippingAddress.fullName error, received ${JSON.stringify(data.errors)}`);
    }
    if (!data.errors?.["shippingAddress.street"]) {
      throw new Error(`Expected shippingAddress.street error, received ${JSON.stringify(data.errors)}`);
    }
    if (!data.errors?.["shippingAddress.postalCode"]) {
      throw new Error(`Expected shippingAddress.postalCode error, received ${JSON.stringify(data.errors)}`);
    }
  });

  await test("Seller elevation onboarding rejects too-short dealership name", async () => {
    const res = await fetch(`${BASE_URL}/api/seller/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: scholarCookie,
      },
      body: JSON.stringify({
        sellerName: "A",
      }),
    });

    if (res.status !== 422) {
      throw new Error(`Expected HTTP 422 for 1-char dealership name, received ${res.status}`);
    }

    const data = await res.json();
    if (!data.errors?.sellerName || !data.errors.sellerName[0].includes("at least 2 characters")) {
      throw new Error(`Expected sellerName length error, received ${JSON.stringify(data.errors?.sellerName)}`);
    }
  });

  await test("Image Upload: Rejects unauthenticated (401) and unauthorized non-seller (403)", async () => {
    const formData = new FormData();
    const tinyFile = new File([new Uint8Array([1, 2, 3])], "sample.png", { type: "image/png" });
    formData.append("file", tinyFile);

    const unauthRes = await fetch(`${BASE_URL}/api/seller/upload`, {
      method: "POST",
      body: formData,
    });
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated upload, got ${unauthRes.status}`);
    }

    const scholarRes = await fetch(`${BASE_URL}/api/seller/upload`, {
      method: "POST",
      headers: { Cookie: scholarCookie },
      body: formData,
    });
    if (scholarRes.status !== 403) {
      throw new Error(`Expected 403 for buyer upload, got ${scholarRes.status}`);
    }
  });

  await test("Image Upload: Rejects request missing file payload with RFC-7807 422", async () => {
    const emptyFormData = new FormData();
    const res = await fetch(`${BASE_URL}/api/seller/upload`, {
      method: "POST",
      headers: { Cookie: sellerCookie },
      body: emptyFormData,
    });

    if (res.status !== 422) {
      throw new Error(`Expected HTTP 422 for missing file, got ${res.status}`);
    }
    const data = await res.json();
    if (!data.errors?.file || !data.errors.file[0].includes("No image file was provided")) {
      throw new Error(`Expected missing file error, got ${JSON.stringify(data.errors)}`);
    }
  });

  await test("Image Upload: Rejects file exceeding 10 MB limit with explicit 422 error", async () => {
    const largeBuffer = new Uint8Array(10 * 1024 * 1024 + 1024);
    const largeFile = new File([largeBuffer], "oversized-folio.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", largeFile);

    const res = await fetch(`${BASE_URL}/api/seller/upload`, {
      method: "POST",
      headers: { Cookie: sellerCookie },
      body: formData,
    });

    if (res.status !== 422) {
      throw new Error(`Expected HTTP 422 for oversized image, got ${res.status}`);
    }
    const data = await res.json();
    const expectedMsg = "File exceeds maximum allowed size of 10 MB. Please upload a smaller image.";
    if (!data.errors?.file || data.errors.file[0] !== expectedMsg) {
      throw new Error(`Expected '${expectedMsg}', got ${JSON.stringify(data.errors?.file)}`);
    }
  });

  await test("Image Upload: Rejects disallowed MIME types (text/plain, pdf, etc.)", async () => {
    const textFile = new File(["not an image"], "notes.txt", { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", textFile);

    const res = await fetch(`${BASE_URL}/api/seller/upload`, {
      method: "POST",
      headers: { Cookie: sellerCookie },
      body: formData,
    });

    if (res.status !== 422) {
      throw new Error(`Expected HTTP 422 for text/plain, got ${res.status}`);
    }
    const data = await res.json();
    if (!data.errors?.file || !data.errors.file[0].includes("Invalid file type")) {
      throw new Error(`Expected invalid file type error, got ${JSON.stringify(data.errors?.file)}`);
    }
  });

  await test("Image Upload: Successfully uploads valid PNG and GET /api/images/[id] serves binary stream", async () => {
    const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const pngBuffer = Buffer.from(base64Png, "base64");
    const validFile = new File([pngBuffer], "archival-illumination.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("file", validFile);

    const uploadRes = await fetch(`${BASE_URL}/api/seller/upload`, {
      method: "POST",
      headers: { Cookie: sellerCookie },
      body: formData,
    });

    if (uploadRes.status !== 201) {
      throw new Error(`Expected HTTP 201 for valid upload, got ${uploadRes.status}`);
    }

    const uploadData = await uploadRes.json();
    if (!uploadData.imageUrl || !uploadData.imageUrl.startsWith("/api/images/")) {
      throw new Error(`Expected /api/images/[id] URL, got ${uploadData.imageUrl}`);
    }
    uploadedImageUrl = uploadData.imageUrl;

    const serveRes = await fetch(`${BASE_URL}${uploadedImageUrl}`);
    if (serveRes.status !== 200) {
      throw new Error(`Expected HTTP 200 from image endpoint, got ${serveRes.status}`);
    }

    const contentType = serveRes.headers.get("content-type");
    if (contentType !== "image/png") {
      throw new Error(`Expected Content-Type image/png, got ${contentType}`);
    }

    const cacheControl = serveRes.headers.get("cache-control") || "";
    if (!cacheControl.includes("immutable")) {
      throw new Error(`Expected immutable Cache-Control, got ${cacheControl}`);
    }

    const imageArrayBuffer = await serveRes.arrayBuffer();
    if (imageArrayBuffer.byteLength !== pngBuffer.length) {
      throw new Error(`Expected byte length ${pngBuffer.length}, got ${imageArrayBuffer.byteLength}`);
    }
  });

  await test("Manuscript Cataloging: Successfully catalogs manuscript referencing local /api/images/[id]", async () => {
    if (!uploadedImageUrl) throw new Error("No uploaded image URL available");

    const bookPayload = {
      title: "Codex Aureus of St. Emmeram",
      authors: ["Liuthard", "Beringer"],
      period: "Medieval",
      subjects: ["Carolingian Gospel", "Illuminated Manuscripts"],
      description: "A 9th-century illuminated Gospel book lavishly decorated with gold and precious stones.",
      isbn: `978-${Date.now().toString().slice(-10)}`,
      format: "Leather-bound",
      price: 1850.0,
      stock: 1,
      imageUrl: uploadedImageUrl,
    };

    const createRes = await fetch(`${BASE_URL}/api/seller/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sellerCookie,
      },
      body: JSON.stringify(bookPayload),
    });

    if (createRes.status !== 201) {
      const err = await createRes.json();
      throw new Error(`Failed to catalog book with local image: ${JSON.stringify(err)}`);
    }

    const createData = await createRes.json();
    if (!createData.book || createData.book.imageUrl !== uploadedImageUrl) {
      throw new Error(`Book imageUrl mismatch: ${createData.book?.imageUrl}`);
    }
  });

  return results;
}
