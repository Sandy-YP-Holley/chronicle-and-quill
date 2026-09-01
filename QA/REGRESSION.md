# Chronicle & Quill — Regression Testing Strategy & Suite Definitions

This document details the multi-tiered regression testing strategy, smoke test checklist, CI/CD pipeline triggers, and verification schedules protecting Chronicle & Quill against functional, security, and performance regressions.

---

## 1. Multi-Tiered Regression Architecture

Chronicle & Quill employs four distinct testing tiers optimized for speed, coverage, and confidence:

```
+-------------------------------------------------------------+
| Tier 4: Pre-Release Production Gate (Build, Headers, Regions)|
+-------------------------------------------------------------+
                              ^
+-------------------------------------------------------------+
| Tier 3: Full Regression Suite (116 API + 26 E2E + 30 Unit)   |
+-------------------------------------------------------------+
                              ^
+-------------------------------------------------------------+
| Tier 2: Smoke Regression Suite (Critical Purchasing Journey)|
+-------------------------------------------------------------+
                              ^
+-------------------------------------------------------------+
| Tier 1: Static Analysis & Unit Boundaries (Vitest, TSC, Lint)|
+-------------------------------------------------------------+
```

---

## 2. Regression Tier Specifications

### Tier 1: Fast Static & Unit Verification
- **Execution Frequency**: Executed pre-commit on every local branch.
- **Duration**: ~2 seconds.
- **Commands**:
  - `npm run typecheck` (`tsc --noEmit`)
  - `npm run lint` (`eslint .`)
  - `npm run test:unit` (`vitest run`)
- **Scope**:
  - Validates TypeScript type contracts across all 48 routes.
  - Zero unused variables or lint warnings.
  - 30 unit tests covering cart quantities, shipping tariffs, state machines, and Zod schemas.

### Tier 2: Smoke Regression Suite
- **Execution Frequency**: Executed on every pull request and staging preview deployment.
- **Duration**: ~10 seconds.
- **Command**: `npx playwright test tests/e2e/smoke-flow.spec.ts`
- **Scope**:
  - Homepage rendering and header navigation.
  - Catalog browsing and manuscript detail inspection.
  - Cart addition and quantity adjustments.
  - Authenticated courier checkout with simulated payment.
  - Order confirmation view (`/order/[id]`) and account history verification.

### Tier 3: Comprehensive Regression Suite
- **Execution Frequency**: Nightly and prior to production release merges.
- **Duration**: ~55 seconds.
- **Command**: `npm run test:all` (executes Unit, Full-Stack QA, and Playwright E2E suites).
- **Scope**:
  - **30 Unit Tests**: Mathematical boundaries and Zod constraints.
  - **116 API & Regression Tests**: Authentication, cart merging, IDOR protection, RBAC multi-role elevation, BOLA guards, and image streaming.
  - **26 Playwright E2E Tests**: Desktop (1440px) and Mobile (390px) responsive viewports, session lifecycle, idempotency guards, and 8 Axe-Core accessibility audits.

### Tier 4: Pre-Release Production Gate
- **Execution Frequency**: Executed against production build before deployment.
- **Duration**: ~60 seconds.
- **Commands**:
  - `npm run build`
  - Verification of security headers (`CSP`, `nosniff`, `DENY`, `HSTS`).
  - Region compliance (`iad1` in `vercel.json`).

---

## 3. Smoke Test Verification Checklist

| Step | Action Under Test | Target Route / Component | Expected Behavior | Automated Test Reference |
| :--- | :--- | :--- | :--- | :--- |
| **SMK-01** | Homepage Load | `/` | Renders hero curation, navigation, and footer without console errors | `tests/e2e/smoke-flow.spec.ts` |
| **SMK-02** | Catalog Stacks | `/books` | Renders 12 book cards, active filters, and pagination | `tests/e2e/responsive-matrix.spec.ts` |
| **SMK-03** | Instant Search | `/search?q=Roman` | Resolves matching folios; displays highlighted titles | `QA/test-phase1-foundation.ts` |
| **SMK-04** | Book Detail | `/books/[id]` | Displays cover image, price guarantee, and Add to Cart button | `tests/e2e/smoke-flow.spec.ts` |
| **SMK-05** | Add to Satchel | Slide-Over Drawer | Increments cart badge count; opens slide-over drawer | `tests/e2e/smoke-flow.spec.ts` |
| **SMK-06** | Scholar Login | `/login` | Authenticates scholar; establishes `cq_session` cookie | `tests/e2e/auth-rbac-lifecycle.spec.ts` |
| **SMK-07** | Checkout | `/checkout` | Pre-fills authenticated scholar; displays address form | `tests/e2e/smoke-flow.spec.ts` |
| **SMK-08** | Order Confirmation| `/order/[id]` | Displays "Archival Dispatch Registered" and Order ID | `tests/e2e/smoke-flow.spec.ts` |
| **SMK-09** | Seller Dashboard | `/seller/dashboard` | Accessible to seller role; blocks regular buyers | `tests/e2e/auth-rbac-lifecycle.spec.ts` |
| **SMK-10** | Admin Suite | `/admin` | Displays system metrics; restricts unauthorized access | `tests/e2e/auth-rbac-lifecycle.spec.ts` |

---

## 4. CI/CD Automation Matrix

| Trigger Event | Target Branch | Pipeline Stage | Tests Executed | Blocking Action |
| :--- | :--- | :--- | :--- | :--- |
| **Pull Request** | `feature/*` -> `main` | Quality Gate | Typecheck + Lint + Unit + Smoke | Blocks PR merge on failure |
| **Merge Event** | `main` | Full Regression | `npm run test:all` (Tier 1 + 2 + 3) | Halts staging deployment |
| **Release Tag** | `v*.*.*` | Production Gate | Tier 4 Build Audit + Production Smoke | Halts Vercel production promotion |
