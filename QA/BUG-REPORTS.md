# Chronicle & Quill — Defect Tracking & Resolution Portfolio

This document defines the defect classification standard (Severity and Priority scales), defect management lifecycle, and full resolution logs for all defects identified and fixed across the development iterations of Chronicle & Quill.

---

## 1. Classification Standards

### 1.1 Severity Classification Scale

| Severity Level | Description | Impact on System |
| :--- | :--- | :--- |
| **S1 — Blocker / Critical** | Complete system failure, authentication bypass, data loss, or server crash. No workaround exists. | Blocks deployment; immediate hotfix required. |
| **S2 — Major** | Core functional feature impaired, security constraint violation, or significant regression in primary user flows. | Must be fixed before production release. |
| **S3 — Normal / Medium** | Secondary functionality impaired, boundary validation formatting issue, or layout misalignment. | Scheduled for resolution within active sprint. |
| **S4 — Minor / Trivial** | Cosmetic defect, minor typo, or minor micro-animation glitch not affecting data flow. | Backlog or polish item. |

### 1.2 Priority Classification Scale

| Priority Level | Resolution SLA | Action Required |
| :--- | :--- | :--- |
| **P1 — Critical / Urgent** | Resolve within 2 hours | Immediate developer assignment; halt downstream testing. |
| **P2 — High** | Resolve within 1 business day | Must be addressed prior to QA sign-off. |
| **P3 — Medium** | Resolve within 3 business days | Standard triage workflow. |
| **P4 — Low** | Resolve as time permits | Non-blocking enhancement. |

---

## 2. Defect Resolution Portfolio

### DEF-001: Unfiltered Password Hash Transmission in Admin User Directory
- **Severity**: S1 (Critical) | **Priority**: P1 (Urgent)
- **Component**: `src/app/api/admin/users/route.ts`
- **Description**: The administrative user list endpoint queried MongoDB with a bare projection, returning sensitive `passwordHash` strings to client-side browser network inspectors.
- **Root Cause**: Missing projection exclusion `{ projection: { passwordHash: 0 } }` in the MongoDB cursor query.
- **Resolution**: Added explicit projection `{ passwordHash: 0 }` to ensure bcrypt credentials never leave the server.
- **Verification**: Verified by automated test in `QA/test-rbac.ts` and Playwright E2E admin suite.
- **Status**: Closed (Verified)

### DEF-002: Referential Integrity Loss on Deleting Ordered Manuscripts
- **Severity**: S2 (Major) | **Priority**: P1 (Urgent)
- **Component**: `src/app/api/seller/books/[id]/route.ts`
- **Description**: When a seller deleted a book that was part of an existing customer order, the document was purged completely (`deleteOne`), causing customer order history pages to throw missing reference errors.
- **Root Cause**: Unconditional document deletion without prior order existence check.
- **Resolution**: Implemented soft-delisting guard: if `orders.findOne({ "items.bookId": bookId })` finds historical orders, the system updates the book with `{ isDelisted: true, stock: 0 }` instead of purging the record.
- **Verification**: Verified in `QA/test-rbac.ts` Guardrail #3 test case.
- **Status**: Closed (Verified)

### DEF-003: State Machine Violation Allowing Edits to Terminal Orders
- **Severity**: S2 (Major) | **Priority**: P2 (High)
- **Component**: `src/app/api/admin/orders/[id]/status/route.ts`
- **Description**: Administrators could transition orders out of terminal states (e.g., reverting `Delivered` or `Cancelled` back to `Pending`), violating financial reconciliation and logistics integrity.
- **Root Cause**: Missing terminal state validation guard before applying status update.
- **Resolution**: Added strict status validation: orders in `Cancelled` or `Delivered` state reject all transitions with RFC-7807 400 Bad Request.
- **Verification**: Verified in `tests/unit/order-state-machine.test.ts` and `QA/test-rbac.ts`.
- **Status**: Closed (Verified)

### DEF-004: Generic Validation Errors Obscuring Form Field Failures
- **Severity**: S3 (Medium) | **Priority**: P2 (High)
- **Component**: `src/lib/api-response.ts`
- **Description**: API validation failures returned generic messages like "Request validation failed. Please check the supplied parameters", preventing users and automated tests from identifying which specific field failed.
- **Root Cause**: Zod error transformer flattened issues into a simple array instead of an indexed RFC-7807 `errors` dictionary.
- **Resolution**: Upgraded `problemResponse()` and `validationErrorResponse()` to return structured `errors: Record<string, string>` where each key matches the exact field path (e.g., `shippingAddress.postalCode`).
- **Verification**: Verified in `QA/test-validation.ts` and unit schema tests.
- **Status**: Closed (Verified)

### DEF-005: Cloudinary Remote Pattern Missing in Next.js Image Config
- **Severity**: S2 (Major) | **Priority**: P2 (High)
- **Component**: `next.config.ts`
- **Description**: Folio covers hosted on `res.cloudinary.com` failed to load in Next.js `<Image />` component with runtime configuration error.
- **Root Cause**: `next.config.ts` allowed only `images.unsplash.com` in `remotePatterns`.
- **Resolution**: Added `res.cloudinary.com` to `remotePatterns` and updated CSP `img-src` policy.
- **Verification**: Verified in production build and Playwright catalog render tests.
- **Status**: Closed (Verified)

### DEF-006: Local File Upload Exceeding MongoDB Atlas Free Tier Limits
- **Severity**: S1 (Critical) | **Priority**: P1 (Urgent)
- **Component**: `src/models/image.ts`, `src/app/api/seller/upload/route.ts`
- **Description**: Embedding base64 image strings directly into `books` documents risked exceeding MongoDB 16 MB document ceiling and bloated query performance.
- **Root Cause**: Monolithic document architecture.
- **Resolution**: Separated images into dedicated `book_images` collection with binary buffer storage and created streaming endpoint `/api/images/[id]` with aggressive HTTP caching (`Cache-Control: immutable`).
- **Verification**: Verified in `QA/test-validation.ts` and Playwright upload tests.
- **Status**: Closed (Verified)

### DEF-007: Next.js Development Server Overlay Obscuring Bottom Left UI
- **Severity**: S4 (Minor) | **Priority**: P4 (Low)
- **Component**: `next.config.ts`
- **Description**: The default Next.js development indicator icon floated on the bottom left corner, covering footer branding.
- **Root Cause**: Default development indicator enabled in Next.js dev server.
- **Resolution**: Configured `devIndicators: false` in `next.config.ts`.
- **Verification**: Verified across browser viewport test runs.
- **Status**: Closed (Verified)

### DEF-008: Slide-Over Cart Drawer Heading Trap in Screen Reader Queries
- **Severity**: S3 (Medium) | **Priority**: P3 (Medium)
- **Component**: `tests/e2e/auth-rbac-lifecycle.spec.ts`
- **Description**: Heading selector `page.locator("h1, h2").first()` matched a hidden `<h2>` inside the closed cart drawer rather than the main page title.
- **Root Cause**: Non-scoped heading queries matching off-screen drawer DOM nodes.
- **Resolution**: Scoped test locators to `main h1, main h2` and added `aria-hidden="true"` to inactive drawer markup.
- **Verification**: Verified in Playwright E2E suite.
- **Status**: Closed (Verified)

---

## 3. Defect Metrics & Quality Summary

- **Total Defects Logged**: 8
- **Total Defects Resolved**: 8 (100%)
- **Open Defects**: 0
- **Regression Rate**: 0%
