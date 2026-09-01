# Chronicle & Quill — Comprehensive Master Test Plan

## 1. Executive Summary & Objective

This Master Test Plan defines the testing strategy, verification framework, quality gates, and risk management criteria for **Chronicle & Quill**, a production-grade digital marketplace and curatorial press specializing in rare folios, historical manuscripts, and antiquarian codices.

The primary objective is to guarantee architectural resilience, cryptographically sound role-based access control (RBAC), server-authoritative inventory locking, accessibility compliance (WCAG 2.1 AA), and zero regressions across the Next.js and MongoDB Atlas stack.

---

## 2. System Architecture & Scope of Testing

### 2.1 Technology Under Test
- **Frontend & App Layer**: Next.js 16 (App Router), React 19, Vanilla Tailwind CSS v4 styling with classical serif typography (Cinzel, Playfair Display, Inter).
- **Backend & APIs**: Next.js Serverless Route Handlers running on Node.js runtime with Edge Middleware security guards.
- **Database & Storage**: MongoDB Atlas Free Tier, featuring multi-collection data integrity (`users`, `books`, `carts`, `orders`, `book_images`, `wishlists`).
- **Authentication**: Stateless, cryptographically signed HS256 JWT sessions stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies (`cq_session`), accompanied by ephemeral guest cart identifiers (`cq_guest_id`).
- **Validation**: Strict schema boundary verification with Zod v3 and RFC-7807 compliant Problem Details responses.

### 2.2 In-Scope Functional Areas
- Antiquarian catalog exploration, instant search, and multi-facet filtering.
- Dual-tier shopping cart with guest-to-scholar session cart merge.
- Server-authoritative courier checkout with simulated payments and `Idempotency-Key` duplicate submission prevention.
- Multi-Role RBAC hierarchy:
  - Buyer (Scholar)
  - Seller (Archivist)
  - Admin (Curatorial Overseer)
- Seller folio creation, dual-source cover selector (HTTPS URL and local binary upload up to 10 MB).
- Admin system supervision: metrics, order management, book deletion protection, user directory.
- Cross-device responsiveness (Desktop 1440px, Tablet 768px, Mobile 390px).
- Accessibility and assistive technology compliance (WCAG 2.1 AA).

### 2.3 Out-of-Scope
- Physical credit card authorization through Stripe or live banking gateways (expressly rejected by server PCI-DSS security guardrails).
- Multi-region replication beyond MongoDB Atlas single primary replica set.

---

## 3. Quality Targets & Exit Criteria

The release must satisfy the following zero-defect acceptance criteria prior to production deployment:

| Dimension | Target Metric | Achieved Status |
| :--- | :--- | :--- |
| **Unit Test Coverage** | 100% pass rate across core business rules | 30 / 30 Passed (100%) |
| **Full-Stack QA API Suite** | 100% pass rate across all route handlers | 116 / 116 Passed (100%) |
| **Playwright Browser E2E** | 100% pass rate across Desktop & Mobile | 26 / 26 Passed (100%) |
| **Accessibility Compliance** | Zero critical/serious WCAG 2.1 AA violations | 0 Violations (Axe-Core Verified) |
| **TypeScript Compilation** | Zero type errors (`tsc --noEmit`) | Clean (0 errors) |
| **Code Linter** | Zero ESLint warnings or errors | Clean (0 errors, 0 warnings) |
| **Production Build** | Zero build or SSG/SSR errors | Clean (48 routes compiled) |

---

## 4. Test Strategy & Testing Levels

The test pyramid for Chronicle & Quill spans five distinct layers:

### 4.1 Unit Testing (`tests/unit/`)
- **Engine**: Vitest v4 with path aliasing.
- **Focus**:
  - Cart item count boundary conditions (0, 1, stock max, negative integers).
  - Subtotal and shipping tariff calculation ($0 free tier at >= $100 vs $5.99 flat courier fee).
  - Order state machine transitions (forward paths, customer cancellation locks, terminal status locks).
  - Zod schema boundary validation (price $0.50-$50,000, stock limits, ISBN validation, regex operator sanitization, image MIME and 10 MB size constraints).

### 4.2 Integration & API Testing (`QA/`)
- **Engine**: Native TypeScript test runners (`tsx`).
- **Focus**:
  - RFC-7807 field-level error formatting and nested error mapping.
  - Multi-role RBAC authorization guards (401 Unauthorized vs 403 Forbidden).
  - Anti-BOLA seller manuscript protection.
  - Image streaming endpoint `/api/images/[id]` binary fidelity.
  - Database connection caching and transaction isolation.

### 4.3 End-to-End Automation (`tests/e2e/`)
- **Engine**: Playwright Test with Chromium engine and multi-viewport matrix.
- **Focus**:
  - Full smoke journey from homepage catalog exploration to authenticated order confirmation.
  - Role lifecycle: Scholar login/logout, Archivist inventory management, Curatorial Admin system monitoring.
  - Button state debounce and double-click idempotency protection.
  - Responsive layout reflow across Desktop (1440x900) and Mobile (390x844).

### 4.4 Automated Accessibility Scanners
- **Engine**: `@axe-core/playwright`.
- **Focus**: Color contrast, ARIA landmarks, form label bindings, focus indicators, keyboard traversability on all public routes.

### 4.5 Manual & Exploratory Charters
- Time-boxed exploratory charters targeting race conditions, session hijacking, edge-case image payloads, and assistive screen reader validation.

---

## 5. Roles & Test Environments

### 5.1 Pre-Configured Test Accounts
- **Scholar (Buyer)**: `scholar@chronicleandquill.com` / `HistoricalReader2026!`
- **Archivist (Seller)**: `seller@chronicleandquill.com` / `HistoricalReader2026!`
- **Curatorial Overseer (Admin)**: `admin@chronicleandquill.com` / `HistoricalReader2026!`

### 5.2 Test Environment Specifications
- **Local Testing**: Node.js 20+, Windows 11, Next.js dev server on port 3000.
- **Staging / Pre-Production**: Vercel Serverless Functions (`iad1` region) linked to MongoDB Atlas M0 cluster.
