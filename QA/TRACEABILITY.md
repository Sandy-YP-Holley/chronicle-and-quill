# Chronicle & Quill — Requirements Traceability Matrix (RTM)

This Requirements Traceability Matrix maps all functional, security, performance, and accessibility requirements to their corresponding automated unit tests, Playwright browser test specs, full-stack QA scripts, and manual test cases.

---

## Traceability Legend
- **Unit**: Vitest unit test suites (`tests/unit/`)
- **E2E**: Playwright end-to-end browser specs (`tests/e2e/`)
- **QA**: Full-stack regression test suites (`QA/`)
- **Manual**: Detailed test cases (`QA/MANUAL-TESTS.md`)

---

## Requirements Mapping Table

| REQ ID | Requirement Description | Component | Unit Tests | E2E Tests | QA API Tests | Manual Cases | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | Paginated Antiquarian Catalog with 12 items/page | `/api/books`, `/books` | `schema-validation.test.ts` | `responsive-matrix.spec.ts` | `test-phase1-foundation.ts` | TC-CAT-01, TC-CAT-10 | PASS |
| **REQ-02** | Full-Text & ISBN Search across titles & authors | `/api/books`, `/search` | `schema-validation.test.ts` | `smoke-flow.spec.ts` | `test-phase1-foundation.ts` | TC-CAT-02, TC-CAT-03 | PASS |
| **REQ-03** | Multi-Facet Filtering (Epoch, Format, Price, Stock) | `/api/books`, `/books` | `schema-validation.test.ts` | `responsive-matrix.spec.ts` | `test-phase1-foundation.ts` | TC-CAT-04, TC-CAT-07 | PASS |
| **REQ-04** | Catalog Sorting (Price Asc/Desc, Era, Title) | `/api/books` | `schema-validation.test.ts` | `responsive-matrix.spec.ts` | `test-phase1-foundation.ts` | TC-CAT-08, TC-CAT-09 | PASS |
| **REQ-05** | Book Detail & Provenance Guarantee View | `/books/[id]` | `pricing-shipping.test.ts` | `smoke-flow.spec.ts` | `test-frontend.ts` | TC-DET-01, TC-DET-02 | PASS |
| **REQ-06** | Vault Inventory Badging (In Stock, Low Stock, Sold) | `/components/books` | `cart-boundary.test.ts` | `stock-idempotency.spec.ts` | `test-phase2-api.ts` | TC-DET-03, TC-DET-05 | PASS |
| **REQ-07** | Slide-Over Archival Satchel (Cart Drawer) | `/components/cart` | `cart-boundary.test.ts` | `responsive-matrix.spec.ts` | `test-frontend.ts` | TC-CRT-02, TC-CRT-03 | PASS |
| **REQ-08** | Upper Inventory Limit Enforcement in Cart | `/api/cart` | `cart-boundary.test.ts` | `stock-idempotency.spec.ts` | `test-phase2-api.ts` | TC-CRT-05 | PASS |
| **REQ-09** | Cart Subtotal & Decimal Precision Rounding | `cart-calc.ts` | `pricing-shipping.test.ts` | `smoke-flow.spec.ts` | `test-phase2-api.ts` | TC-CRT-03, TC-CRT-06 | PASS |
| **REQ-10** | $100 Free Shipping Tier ($5.99 Standard Courier) | `cart-calc.ts` | `pricing-shipping.test.ts` | `smoke-flow.spec.ts` | `test-phase2-api.ts` | TC-CRT-06, TC-CRT-07 | PASS |
| **REQ-11** | Guest-to-Scholar Session Cart Merging | `/api/auth/login` | `cart-boundary.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-phase2-api.ts` | TC-CRT-10, TC-CRT-11 | PASS |
| **REQ-12** | Dedicated Cart Overview Page (`/cart`) | `/app/cart` | `pricing-shipping.test.ts` | `responsive-matrix.spec.ts` | `test-frontend.ts` | TC-CRT-08, TC-CRT-09 | PASS |
| **REQ-13** | Personal Scholar Wishlist Collection | `/api/wishlist` | `schema-validation.test.ts` | `smoke-flow.spec.ts` | `test-phase2-api.ts` | TC-DET-07 | PASS |
| **REQ-14** | Simulated Courier Checkout with Idempotency Key | `/api/checkout` | `order-state-machine.test.ts` | `stock-idempotency.spec.ts` | `test-phase2-api.ts` | TC-CHK-05, TC-CHK-06 | PASS |
| **REQ-15** | PCI-DSS Card Number Rejection Guard | `/api/checkout` | `schema-validation.test.ts` | `smoke-flow.spec.ts` | `test-phase2-api.ts` | TC-CHK-04 | PASS |
| **REQ-16** | Atomic Database Inventory Decrement on Order | `/api/checkout` | `order-state-machine.test.ts` | `stock-idempotency.spec.ts` | `test-phase2-api.ts` | TC-CHK-06 | PASS |
| **REQ-17** | Visual Order Confirmation & Lifecycle Tracker | `/app/order/[id]` | `order-state-machine.test.ts` | `smoke-flow.spec.ts` | `test-frontend.ts` | TC-CHK-07 | PASS |
| **REQ-18** | Anti-IDOR Customer Order Security | `/api/orders/[id]` | `order-state-machine.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-phase2-api.ts` | TC-CHK-09 | PASS |
| **REQ-19** | Buyer Order Cancellation & Stock Restoration | `/api/orders/[id]` | `order-state-machine.test.ts` | `smoke-flow.spec.ts` | `test-phase2-api.ts` | TC-CHK-08 | PASS |
| **REQ-20** | Multi-Role User Model (Buyer, Seller, Admin) | `/models/user.ts` | `schema-validation.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-rbac.ts` | TC-ROL-01, TC-ROL-02 | PASS |
| **REQ-21** | Pre-Configured Hardcoded Curatorial Admin | `scripts/seed.ts` | `schema-validation.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-rbac.ts` | TC-ROL-08 | PASS |
| **REQ-22** | Archivist Seller Elevation Onboarding Portal | `/seller/onboard` | `schema-validation.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-rbac.ts` | TC-ROL-04, TC-ROL-05 | PASS |
| **REQ-23** | Anti-BOLA Seller Inventory Isolation Guard | `/api/seller/books` | `schema-validation.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-rbac.ts` | TC-ROL-10, TC-SEL-08 | PASS |
| **REQ-24** | Ordered Manuscript Soft-Delist Protection | `/api/seller/books` | `order-state-machine.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-rbac.ts` | TC-SEL-08 | PASS |
| **REQ-25** | Curatorial Admin System Overview & Metrics | `/api/admin/metrics` | `schema-validation.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-rbac.ts` | TC-ADM-01 | PASS |
| **REQ-26** | User Directory Password Hash Projection Omission | `/api/admin/users` | `schema-validation.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-rbac.ts` | TC-ADM-02 | PASS |
| **REQ-27** | Terminal Order Status Immutability Lock | `/api/admin/orders` | `order-state-machine.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-rbac.ts` | TC-ADM-07, TC-ADM-08 | PASS |
| **REQ-28** | Local Image Upload up to 10 MB & Binary Serving | `/api/seller/upload` | `schema-validation.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-validation.ts` | TC-SEL-03, TC-SEL-05 | PASS |
| **REQ-29** | RFC-7807 Detailed Field Error Formatting | `api-response.ts` | `schema-validation.test.ts` | `auth-rbac-lifecycle.spec.ts` | `test-validation.ts` | TC-CHK-03, TC-ROL-04 | PASS |
| **REQ-30** | WCAG 2.1 AA Accessibility & Responsive Reflow | Full Application | `pricing-shipping.test.ts` | `accessibility.spec.ts` | `test-frontend.ts` | TC-A11-01 to TC-PER-03 | PASS |

---

## Verification Coverage Summary
- **Total Functional Requirements**: 30
- **Automated Verification Coverage**: 100% (30 / 30 Requirements covered by automated unit, E2E, or QA tests)
- **Manual Verification Coverage**: 100% (30 / 30 Requirements covered across 90 manual test cases)
- **Overall Traceability Status**: Fully Satisfied and Closed
