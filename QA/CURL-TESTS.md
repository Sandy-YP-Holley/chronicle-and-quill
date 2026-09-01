# Chronicle & Quill — Reproducible cURL API Test Matrix

This document provides exact, reproducible `curl` commands testing every API endpoint in Chronicle & Quill, including status assertions, authentication cookie requirements, and expected RFC-7807 problem json structures.

---

## 1. Authentication & Identity Endpoints

### 1.1 Scholar Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hypatia of Alexandria",
    "email": "hypatia@alexandria.edu",
    "password": "HistoricalReader2026!",
    "confirmPassword": "HistoricalReader2026!"
  }'
```
- **Expected Status**: `201 Created`
- **Response**:
```json
{
  "user": {
    "name": "Hypatia of Alexandria",
    "email": "hypatia@alexandria.edu",
    "role": "buyer",
    "isApprovedSeller": false
  }
}
```

### 1.2 Duplicate Email Rejection
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Scholar",
    "email": "scholar@chronicleandquill.com",
    "password": "HistoricalReader2026!",
    "confirmPassword": "HistoricalReader2026!"
  }'
```
- **Expected Status**: `409 Conflict`
- **Response Content-Type**: `application/problem+json`

### 1.3 Scholar Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "scholar@chronicleandquill.com",
    "password": "HistoricalReader2026!"
  }'
```
- **Expected Status**: `200 OK`
- **Response**: Sets `Set-Cookie: cq_session=...; HttpOnly; Path=/; SameSite=Lax`

### 1.4 Get Authenticated Identity
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```
- **Expected Status**: `200 OK`
- **Response**: Contains `id`, `email`, `name`, `role: "buyer"`.

### 1.5 Safe Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```
- **Expected Status**: `200 OK`
- **Response**: Sets `Set-Cookie: cq_session=; Path=/; Max-Age=0`

---

## 2. Catalog & Books Endpoints

### 2.1 Fetch Public Catalog (Paginated)
```bash
curl -X GET "http://localhost:3000/api/books?page=1&limit=12"
```
- **Expected Status**: `200 OK`
- **Response**: Contains `items` array and `pagination` metadata object.

### 2.2 Filter by Epoch & Price Range
```bash
curl -X GET "http://localhost:3000/api/books?period=Antiquity&priceMin=15&priceMax=100"
```
- **Expected Status**: `200 OK`
- **Response**: All returned items have `period: "Antiquity"` and price within `[15, 100]`.

### 2.3 Search Catalog by Text
```bash
curl -X GET "http://localhost:3000/api/books?search=Roman"
```
- **Expected Status**: `200 OK`

### 2.4 Query Validation Failure (RFC-7807)
```bash
curl -X GET "http://localhost:3000/api/books?limit=999"
```
- **Expected Status**: `422 Unprocessable Content`
- **Response**:
```json
{
  "type": "https://chronicleandquill.com/probs/validation-error",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Request validation failed. Please check the supplied parameters.",
  "instance": "/api/books",
  "errors": {
    "limit": "Number must be less than or equal to 50"
  }
}
```

---

## 3. Cart & Satchel Endpoints

### 3.1 Get Cart (Guest Mode)
```bash
curl -X GET http://localhost:3000/api/cart \
  -c guest_cookies.txt
```
- **Expected Status**: `200 OK`
- **Response**: Sets `cq_guest_id` cookie and returns empty cart structure.

### 3.2 Add Item to Cart
```bash
curl -X POST http://localhost:3000/api/cart \
  -b guest_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "65f000000000000000000001",
    "quantity": 1
  }'
```
- **Expected Status**: `200 OK`
- **Response**: Updated cart with line item, subtotal, and shipping fee calculation.

### 3.3 Clear Cart
```bash
curl -X DELETE http://localhost:3000/api/cart \
  -b guest_cookies.txt
```
- **Expected Status**: `200 OK`

---

## 4. Checkout & Order Endpoints

### 4.1 PCI-DSS Security Guard Test (Rejected)
```bash
curl -X POST http://localhost:3000/api/checkout \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "fullName": "Marcus Aurelius",
      "street": "42 Palatine Hill",
      "city": "Rome",
      "postalCode": "00184",
      "country": "Italy"
    },
    "creditCardNumber": "4111111111111111",
    "cvv": "123"
  }'
```
- **Expected Status**: `400 Bad Request`
- **Response**: Explicit PCI-DSS error rejecting card parameters.

### 4.2 Simulated Courier Checkout with Idempotency Key
```bash
curl -X POST http://localhost:3000/api/checkout \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: folio-idem-key-001" \
  -d '{
    "shippingAddress": {
      "fullName": "Marcus Aurelius",
      "street": "42 Palatine Hill",
      "city": "Rome",
      "postalCode": "00184",
      "country": "Italy"
    }
  }'
```
- **Expected Status**: `201 Created`
- **Response**: Contains `orderId`, `status: "Pending"`, `payment: { "isTestOrder": true }`.

### 4.3 Idempotency Re-Submission
```bash
curl -X POST http://localhost:3000/api/checkout \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: folio-idem-key-001" \
  -d '{
    "shippingAddress": {
      "fullName": "Marcus Aurelius",
      "street": "42 Palatine Hill",
      "city": "Rome",
      "postalCode": "00184",
      "country": "Italy"
    }
  }'
```
- **Expected Status**: `200 OK`
- **Response**: Returns existing order ID without creating a second record or deducting inventory twice.

### 4.4 Buyer Order Status Cancellation
```bash
curl -X PATCH http://localhost:3000/api/orders/[orderId]/status \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{ "status": "Cancelled" }'
```
- **Expected Status**: `200 OK`

---

## 5. Seller Dealership & Image Upload Endpoints

### 5.1 Seller Dealership Elevation Onboarding
```bash
curl -X POST http://localhost:3000/api/seller/onboard \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "sellerName": "Alexandria Rare Folios",
    "sellerBio": "Purveyors of Mediterranean and Hellenistic scrolls."
  }'
```
- **Expected Status**: `200 OK`
- **Response**: Role elevated to `"seller"`.

### 5.2 Seller Local Image Upload (Multipart Form Data)
```bash
curl -X POST http://localhost:3000/api/seller/upload \
  -b seller_cookies.txt \
  -F "file=@./test_cover.png;type=image/png"
```
- **Expected Status**: `201 Created`
- **Response**:
```json
{
  "imageId": "6789abcdef0123456789abcd",
  "imageUrl": "/api/images/6789abcdef0123456789abcd",
  "filename": "test_cover.png",
  "contentType": "image/png",
  "size": 204850
}
```

### 5.3 Fetch Uploaded Image Binary Stream
```bash
curl -X GET http://localhost:3000/api/images/6789abcdef0123456789abcd \
  -o downloaded_cover.png
```
- **Expected Status**: `200 OK`
- **Headers**:
  - `Content-Type: image/png`
  - `Cache-Control: public, max-age=31536000, immutable`

### 5.4 Seller Manuscript Creation
```bash
curl -X POST http://localhost:3000/api/seller/books \
  -b seller_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meditations of Marcus Aurelius",
    "authors": ["Marcus Aurelius"],
    "period": "Antiquity",
    "subjects": ["Philosophy", "Stoicism"],
    "format": "Leather-bound",
    "publicationYear": 180,
    "price": 45.00,
    "stock": 5,
    "imageUrl": "/api/images/6789abcdef0123456789abcd",
    "description": "Exquisite Latin codex bound in full morocco leather."
  }'
```
- **Expected Status**: `201 Created`

---

## 6. Curatorial Overseer Admin Endpoints

### 6.1 Get Admin System Metrics
```bash
curl -X GET http://localhost:3000/api/admin/metrics \
  -b admin_cookies.txt
```
- **Expected Status**: `200 OK`
- **Response**: Contains `totalRevenue`, `totalOrders`, `totalBooks`, `totalUsers`, `sellerCount`.

### 6.2 Get Admin User Directory (Password Hash Omitted)
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -b admin_cookies.txt
```
- **Expected Status**: `200 OK`
- **Verification**: Ensure no `passwordHash` appears anywhere in response.

### 6.3 Admin Terminal State Guard
```bash
curl -X PATCH http://localhost:3000/api/admin/orders/[deliveredOrderId]/status \
  -b admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{ "status": "Pending" }'
```
- **Expected Status**: `400 Bad Request`
- **Response**: Problem json indicating transition out of terminal state is strictly rejected.
