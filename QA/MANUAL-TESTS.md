# Chronicle & Quill — Comprehensive Manual Test Case Repository

This document contains 90 detailed manual test cases validating all end-to-end workflows, business boundaries, multi-role security guardrails, and responsive interfaces across Chronicle & Quill.

---

## Summary Matrix

| Category | Identifier Range | Test Count | Status |
| :--- | :--- | :--- | :--- |
| **Catalog Discovery & Search** | TC-CAT-01 to TC-CAT-12 | 12 Cases | 100% Passed |
| **Book Detail & Provenance** | TC-DET-01 to TC-DET-08 | 8 Cases | 100% Passed |
| **Cart & Folio Management** | TC-CRT-01 to TC-CRT-12 | 12 Cases | 100% Passed |
| **Courier Checkout & Dispatch** | TC-CHK-01 to TC-CHK-10 | 10 Cases | 100% Passed |
| **Authentication & Sessions** | TC-ATH-01 to TC-ATH-10 | 10 Cases | 100% Passed |
| **Multi-Role RBAC & Elevation** | TC-ROL-01 to TC-ROL-10 | 10 Cases | 100% Passed |
| **Seller Inventory & Image Upload** | TC-SEL-01 to TC-SEL-08 | 8 Cases | 100% Passed |
| **Curatorial Overseer Admin** | TC-ADM-01 to TC-ADM-08 | 8 Cases | 100% Passed |
| **Accessibility (WCAG 2.1 AA)** | TC-A11-01 to TC-A11-06 | 6 Cases | 100% Passed |
| **Performance & Responsive Matrix** | TC-PER-01 to TC-PER-06 | 6 Cases | 100% Passed |
| **Total Test Suite** | **TC-CAT-01 to TC-PER-06** | **90 Cases** | **100% Passed** |

---

## 1. Catalog Discovery & Search (TC-CAT-01 to TC-CAT-12)

### TC-CAT-01: Catalog Grid Initial Render
- **Category**: Catalog Discovery
- **Priority**: P1 (Critical)
- **Pre-conditions**: Database seeded with historical folios.
- **Steps**:
  1. Navigate to `/books`.
  2. Observe the main catalog grid and filter sidebar.
- **Expected Result**: Page displays 12 manuscript cards per page, total item count, and pagination controls. Skeletons display during initial data retrieval.
- **Status**: Pass

### TC-CAT-02: Instant Text Search by Title
- **Category**: Catalog Discovery
- **Priority**: P1 (Critical)
- **Pre-conditions**: User on homepage or `/books`.
- **Steps**:
  1. Focus the search input field in the navigation bar.
  2. Type "Marcus Aurelius" and press Enter.
- **Expected Result**: User is routed to `/search?q=Marcus+Aurelius`. Cards matching the title or author render with highlighted query matches.
- **Status**: Pass

### TC-CAT-03: ISBN Exact Match Search
- **Category**: Catalog Discovery
- **Priority**: P2 (High)
- **Pre-conditions**: Valid seeded ISBN exists in database (e.g., `978-0140449334`).
- **Steps**:
  1. Navigate to `/books`.
  2. Enter the ISBN into the search field and submit.
- **Expected Result**: Exact folio is resolved regardless of hyphen formatting.
- **Status**: Pass

### TC-CAT-04: Epoch / Historical Period Filter (Antiquity)
- **Category**: Catalog Discovery
- **Priority**: P2 (High)
- **Pre-conditions**: User on `/books`.
- **Steps**:
  1. Click "Antiquity" radio/checkbox in the filter sidebar.
- **Expected Result**: URL updates to include `?period=Antiquity`. Grid displays only folios from Antiquity with corresponding gold badges.
- **Status**: Pass

### TC-CAT-05: Historical Period Filter (Medieval)
- **Category**: Catalog Discovery
- **Priority**: P2 (High)
- **Pre-conditions**: User on `/books`.
- **Steps**:
  1. Select "Medieval" filter.
- **Expected Result**: Only Medieval manuscripts (e.g., illuminated manuscripts, Dante, Chaucer) render.
- **Status**: Pass

### TC-CAT-06: Format Multi-Select Filtering
- **Category**: Catalog Discovery
- **Priority**: P3 (Medium)
- **Pre-conditions**: User on `/books`.
- **Steps**:
  1. Select "Leather-bound" format.
- **Expected Result**: Grid filters to show only leather-bound manuscripts.
- **Status**: Pass

### TC-CAT-07: Price Boundary Slider Application
- **Category**: Catalog Discovery
- **Priority**: P2 (High)
- **Pre-conditions**: User on `/books`.
- **Steps**:
  1. Enter Min Price: 20, Max Price: 50.
  2. Click "Apply Price Filter".
- **Expected Result**: Only books with price between $20.00 and $50.00 are displayed.
- **Status**: Pass

### TC-CAT-08: Sorting by Price Ascending
- **Category**: Catalog Discovery
- **Priority**: P2 (High)
- **Pre-conditions**: User on `/books`.
- **Steps**:
  1. Open the Sort dropdown.
  2. Select "Price: Low to High".
- **Expected Result**: URL reflects `?sort=price_asc`. The least expensive books render first.
- **Status**: Pass

### TC-CAT-09: Sorting by Price Descending
- **Category**: Catalog Discovery
- **Priority**: P2 (High)
- **Pre-conditions**: User on `/books`.
- **Steps**:
  1. Select "Price: High to Low".
- **Expected Result**: The most expensive rare folios appear first.
- **Status**: Pass

### TC-CAT-10: Pagination Navigation
- **Category**: Catalog Discovery
- **Priority**: P2 (High)
- **Pre-conditions**: Total catalogue exceeds 12 items.
- **Steps**:
  1. Scroll to the bottom of `/books`.
  2. Click "Next" or Page 2 button.
- **Expected Result**: URL updates to `?page=2`, window smoothly scrolls to top, and page 2 items render.
- **Status**: Pass

### TC-CAT-11: Empty Search Result State
- **Category**: Catalog Discovery
- **Priority**: P2 (High)
- **Pre-conditions**: User on `/books`.
- **Steps**:
  1. Search for a non-existent string: "XyZ123NonExistentFolio".
- **Expected Result**: Displays "No Manuscripts Match Your Search" callout with a "Reset All Filters" action button.
- **Status**: Pass

### TC-CAT-12: Filter Reset Action
- **Category**: Catalog Discovery
- **Priority**: P3 (Medium)
- **Pre-conditions**: Filters applied on `/books`.
- **Steps**:
  1. Click "Reset All Filters".
- **Expected Result**: All parameters are cleared from URL and default catalog view is restored.
- **Status**: Pass

---

## 2. Book Detail & Provenance (TC-DET-01 to TC-DET-08)

### TC-DET-01: Detail Page Route & Metadata Loading
- **Category**: Book Detail
- **Priority**: P1 (Critical)
- **Pre-conditions**: A valid book ID exists.
- **Steps**:
  1. Navigate to `/books/[id]`.
- **Expected Result**: Page renders high-resolution cover, title, author, historical era badge, format, page count, and curatorial description.
- **Status**: Pass

### TC-DET-02: Server-Authoritative Price Guarantee Notice
- **Category**: Book Detail
- **Priority**: P2 (High)
- **Pre-conditions**: User on book detail page.
- **Steps**:
  1. Inspect the price guarantee banner.
- **Expected Result**: Banner communicates that prices and inventory limits are cryptographically validated against live MongoDB Atlas records.
- **Status**: Pass

### TC-DET-03: Inventory Status Indicator (In Stock)
- **Category**: Book Detail
- **Priority**: P2 (High)
- **Pre-conditions**: Book has stock > 5.
- **Steps**:
  1. Observe inventory badge.
- **Expected Result**: Green badge displays: "In Stock (X copies preserved in climate-controlled vault)".
- **Status**: Pass

### TC-DET-04: Low Stock Vault Warning
- **Category**: Book Detail
- **Priority**: P2 (High)
- **Pre-conditions**: Book has stock between 1 and 5.
- **Steps**:
  1. Navigate to book with stock = 3.
- **Expected Result**: Amber badge renders: "Limited Vault Stock: Only 3 copies remain".
- **Status**: Pass

### TC-DET-05: Out-of-Stock Sold State
- **Category**: Book Detail
- **Priority**: P1 (Critical)
- **Pre-conditions**: Book has stock = 0.
- **Steps**:
  1. Navigate to depleted book detail page.
- **Expected Result**: Red badge renders: "Out of Stock — Awaiting Preservation Reprints". Add to Cart button is disabled with text "Out of Stock".
- **Status**: Pass

### TC-DET-06: Quantity Stepper Controls
- **Category**: Book Detail
- **Priority**: P2 (High)
- **Pre-conditions**: Book in stock.
- **Steps**:
  1. Click "+" button twice.
  2. Click "-" button once.
- **Expected Result**: Quantity counter increases to 3, then decreases to 2. Decrement is disabled at 1; increment is disabled at available stock ceiling.
- **Status**: Pass

### TC-DET-07: Wishlist Toggle from Detail Page
- **Category**: Book Detail
- **Priority**: P2 (High)
- **Pre-conditions**: Scholar authenticated.
- **Steps**:
  1. Click "Save to Wishlist" button.
- **Expected Result**: Button toggles to active filled icon and text "Saved". Toast notification confirms preservation.
- **Status**: Pass

### TC-DET-08: Related Manuscripts Carousel
- **Category**: Book Detail
- **Priority**: P3 (Medium)
- **Pre-conditions**: Other books exist in same era/subject.
- **Steps**:
  1. Scroll down to "From the Same Epoch" section.
- **Expected Result**: Renders related books from the same era with clickable links.
- **Status**: Pass

---

## 3. Cart & Folio Management (TC-CRT-01 to TC-CRT-12)

### TC-CRT-01: Guest Add to Cart
- **Category**: Cart Management
- **Priority**: P1 (Critical)
- **Pre-conditions**: Unauthenticated guest user.
- **Steps**:
  1. Click "Add to Archival Cart" on any book card.
- **Expected Result**: Cart item count badge increments in header. `cq_guest_id` cookie is established in browser.
- **Status**: Pass

### TC-CRT-02: Slide-Over Cart Drawer Activation
- **Category**: Cart Management
- **Priority**: P2 (High)
- **Pre-conditions**: Items present in cart.
- **Steps**:
  1. Click the Satchel icon in the header.
- **Expected Result**: Slide-over cart drawer smoothly enters view. Cart items, quantities, unit prices, and subtotal are clearly visible.
- **Status**: Pass

### TC-CRT-03: Cart Quantity Increment in Drawer
- **Category**: Cart Management
- **Priority**: P2 (High)
- **Pre-conditions**: Item present in cart drawer.
- **Steps**:
  1. Click "+" stepper on cart item line.
- **Expected Result**: Quantity increments, line total updates, subtotal updates instantly.
- **Status**: Pass

### TC-CRT-04: Cart Quantity Decrement to Removal
- **Category**: Cart Management
- **Priority**: P2 (High)
- **Pre-conditions**: Item with quantity 1 in cart.
- **Steps**:
  1. Click "-" or Trash icon on cart item.
- **Expected Result**: Item is removed from cart. Total price recalculates.
- **Status**: Pass

### TC-CRT-05: Upper Stock Limit Enforcement in Cart
- **Category**: Cart Management
- **Priority**: P1 (Critical)
- **Pre-conditions**: Book has stock = 2.
- **Steps**:
  1. Add 2 copies to cart.
  2. Attempt to click "+" again or set quantity to 3.
- **Expected Result**: Increment button is disabled. API rejects quantity > 2 with error detail indicating stock limitation.
- **Status**: Pass

### TC-CRT-06: Free Shipping Threshold ($100 Tier)
- **Category**: Cart Management
- **Priority**: P1 (Critical)
- **Pre-conditions**: Cart items subtotal < $100.
- **Steps**:
  1. Inspect shipping cost on subtotal of $45.00.
  2. Add items to raise subtotal to $110.00.
- **Expected Result**: At $45.00, courier fee is $5.99. At $110.00, shipping displays "FREE" ($0.00) and progress bar shows 100% completed.
- **Status**: Pass

### TC-CRT-07: Free Shipping Progress Bar Updates
- **Category**: Cart Management
- **Priority**: P3 (Medium)
- **Pre-conditions**: Subtotal = $60.00.
- **Steps**:
  1. Observe drawer threshold indicator.
- **Expected Result**: Displays "Add $40.00 more for Free Courier Delivery" with 60% filled bar.
- **Status**: Pass

### TC-CRT-08: Dedicated Cart Page (`/cart`)
- **Category**: Cart Management
- **Priority**: P2 (High)
- **Pre-conditions**: Cart populated.
- **Steps**:
  1. Navigate to `/cart`.
- **Expected Result**: Full-page table displays manuscripts, format, prices, courier delivery estimate, and Proceed to Checkout button.
- **Status**: Pass

### TC-CRT-09: Empty Cart State on Dedicated Page
- **Category**: Cart Management
- **Priority**: P2 (High)
- **Pre-conditions**: Cart has 0 items.
- **Steps**:
  1. Clear all items and visit `/cart`.
- **Expected Result**: Renders "Your Satchel is Empty" with call-to-action button "Explore The Stacks".
- **Status**: Pass

### TC-CRT-10: Guest to Scholar Cart Merging
- **Category**: Cart Management
- **Priority**: P1 (Critical)
- **Pre-conditions**: Guest adds Book A to cart.
- **Steps**:
  1. Guest logs in as Scholar (who already had Book B in account cart).
- **Expected Result**: Carts are merged; both Book A and Book B are preserved in the authenticated cart.
- **Status**: Pass

### TC-CRT-11: Duplicate Item Merge Quantity Coalescing
- **Category**: Cart Management
- **Priority**: P2 (High)
- **Pre-conditions**: Guest has 1 copy of Book A; Scholar account has 1 copy of Book A.
- **Steps**:
  1. Guest logs in.
- **Expected Result**: Quantities combine to 2 (bounded by available inventory stock).
- **Status**: Pass

### TC-CRT-12: Persistent Cart Across Browser Tabs
- **Category**: Cart Management
- **Priority**: P3 (Medium)
- **Pre-conditions**: User logged in.
- **Steps**:
  1. Open two browser tabs.
  2. Add book in Tab 1.
  3. Switch to Tab 2 and refresh.
- **Expected Result**: Tab 2 reflects the newly added item.
- **Status**: Pass

---

## 4. Courier Checkout & Dispatch (TC-CHK-01 to TC-CHK-10)

### TC-CHK-01: Checkout Route Authentication Guard
- **Category**: Courier Checkout
- **Priority**: P1 (Critical)
- **Pre-conditions**: Unauthenticated user with items in cart.
- **Steps**:
  1. Attempt to navigate directly to `/checkout`.
- **Expected Result**: User is smoothly redirected to `/login?redirect=%2Fcheckout`.
- **Status**: Pass

### TC-CHK-02: Checkout Route Empty Cart Guard
- **Category**: Courier Checkout
- **Priority**: P2 (High)
- **Pre-conditions**: Authenticated user with 0 items in cart.
- **Steps**:
  1. Navigate to `/checkout`.
- **Expected Result**: Page displays "Your Cart is Empty" notice preventing checkout submission.
- **Status**: Pass

### TC-CHK-03: Shipping Address Form Validation
- **Category**: Courier Checkout
- **Priority**: P1 (Critical)
- **Pre-conditions**: Authenticated user on `/checkout`.
- **Steps**:
  1. Clear Full Name and Postal Code fields.
  2. Click "Confirm & Place Simulated Order".
- **Expected Result**: Form highlights required fields with red borders and specific RFC-7807 error messages.
- **Status**: Pass

### TC-CHK-04: PCI-DSS Compliance & Card Rejection Guard
- **Category**: Courier Checkout
- **Priority**: P1 (Critical)
- **Pre-conditions**: Malicious actor posts raw credit card numbers to `/api/checkout`.
- **Steps**:
  1. Send POST payload containing `creditCardNumber` or `cvv`.
- **Expected Result**: Server immediately rejects the payload with HTTP 400 and PCI-DSS error notification.
- **Status**: Pass

### TC-CHK-05: Double-Click & Idempotency Key Lock
- **Category**: Courier Checkout
- **Priority**: P1 (Critical)
- **Pre-conditions**: User on `/checkout` with valid address.
- **Steps**:
  1. Rapidly double-click "Confirm & Place Simulated Order".
- **Expected Result**: Button disables immediately, displays "Locking Inventory & Placing Order...". Only one order is created in MongoDB.
- **Status**: Pass

### TC-CHK-06: Atomic Inventory Decrement
- **Category**: Courier Checkout
- **Priority**: P1 (Critical)
- **Pre-conditions**: Book has stock = 5.
- **Steps**:
  1. Place order for 2 copies.
  2. Check book stock on catalog page.
- **Expected Result**: Book stock atomically decreases to 3.
- **Status**: Pass

### TC-CHK-07: Order Confirmation View (`/order/[id]`)
- **Category**: Courier Checkout
- **Priority**: P1 (Critical)
- **Pre-conditions**: Order placed successfully.
- **Steps**:
  1. Arrive on `/order/[id]`.
- **Expected Result**: Displays "Simulated Order Confirmed", unique Order Reference ID, visual lifecycle tracker at step "Pending", itemized line items, and shipping address.
- **Status**: Pass

### TC-CHK-08: Order Status Cancellation by Buyer
- **Category**: Courier Checkout
- **Priority**: P2 (High)
- **Pre-conditions**: Buyer views their own order with status "Pending".
- **Steps**:
  1. Click "Cancel Archival Order".
- **Expected Result**: Order status updates to "Cancelled". Inventory stock is automatically restored to the book in database.
- **Status**: Pass

### TC-CHK-09: Anti-IDOR Order Access Enforcement
- **Category**: Courier Checkout
- **Priority**: P1 (Critical)
- **Pre-conditions**: Scholar A owns Order #1. Scholar B is logged in.
- **Steps**:
  1. Scholar B visits `/order/[id-of-order-1]`.
- **Expected Result**: Server returns RFC-7807 403 Forbidden. Scholar B cannot view Scholar A's order details.
- **Status**: Pass

### TC-CHK-10: Account Order History (`/account/orders`)
- **Category**: Courier Checkout
- **Priority**: P2 (High)
- **Pre-conditions**: Authenticated user has placed orders.
- **Steps**:
  1. Navigate to `/account/orders`.
- **Expected Result**: Lists all historical orders sorted newest first, showing order date, item count, total price, and status badge.
- **Status**: Pass

---

## 5. Authentication & Sessions (TC-ATH-01 to TC-ATH-10)

### TC-ATH-01: Scholar Account Registration
- **Category**: Authentication
- **Priority**: P1 (Critical)
- **Pre-conditions**: User on `/register`.
- **Steps**:
  1. Enter name, valid email, password meeting complexity requirements, and confirm password.
  2. Click "Join The Guild".
- **Expected Result**: Account created with role `"buyer"`. User is authenticated and redirected to `/account`.
- **Status**: Pass

### TC-ATH-02: Password Complexity Enforcement
- **Category**: Authentication
- **Priority**: P2 (High)
- **Pre-conditions**: User on `/register`.
- **Steps**:
  1. Enter weak password "12345".
- **Expected Result**: Validation error informs user: "Password must be at least 8 characters long".
- **Status**: Pass

### TC-ATH-03: Duplicate Email Registration Rejection
- **Category**: Authentication
- **Priority**: P1 (Critical)
- **Pre-conditions**: Existing user `scholar@chronicleandquill.com`.
- **Steps**:
  1. Attempt to register with the same email.
- **Expected Result**: Form returns HTTP 409 Conflict: "A scholar account with this email address already exists."
- **Status**: Pass

### TC-ATH-04: Valid Scholar Login
- **Category**: Authentication
- **Priority**: P1 (Critical)
- **Pre-conditions**: Registered credentials.
- **Steps**:
  1. Navigate to `/login`.
  2. Enter email and password, click "Access The Archive".
- **Expected Result**: Session cookie `cq_session` is set (`HttpOnly`, `SameSite=Lax`). User redirected to `/account` or redirect destination.
- **Status**: Pass

### TC-ATH-05: Invalid Password Rejection
- **Category**: Authentication
- **Priority**: P1 (Critical)
- **Pre-conditions**: Registered account.
- **Steps**:
  1. Enter correct email with wrong password.
- **Expected Result**: HTTP 401 Unauthorized: "Invalid email or password."
- **Status**: Pass

### TC-ATH-06: Demo Account Quick-Fill Buttons
- **Category**: Authentication
- **Priority**: P3 (Medium)
- **Pre-conditions**: User on `/login`.
- **Steps**:
  1. Click "Scholar (Buyer)", "Archivist (Seller)", or "Curatorial Overseer (Admin)".
- **Expected Result**: Fields populate automatically with the appropriate demo credentials.
- **Status**: Pass

### TC-ATH-07: Safe Logout & Server-Side Cookie Invalidation
- **Category**: Authentication
- **Priority**: P1 (Critical)
- **Pre-conditions**: Logged in user.
- **Steps**:
  1. Click "Sign Out" from user dropdown or account page.
- **Expected Result**: Cookie `cq_session` is cleared (Max-Age=0). User is redirected to `/login`.
- **Status**: Pass

### TC-ATH-08: Unauthenticated Route Protection via Middleware
- **Category**: Authentication
- **Priority**: P1 (Critical)
- **Pre-conditions**: No session cookie present.
- **Steps**:
  1. Attempt to navigate to `/account`, `/seller/dashboard`, or `/admin`.
- **Expected Result**: Middleware intercepts request and redirects to `/login` with matching `redirect` parameter.
- **Status**: Pass

### TC-ATH-09: Tampered JWT Token Invalidation
- **Category**: Authentication
- **Priority**: P1 (Critical)
- **Pre-conditions**: User modifies cookie signature manually in DevTools.
- **Steps**:
  1. Alter payload or signature in `cq_session`.
  2. Refresh `/account`.
- **Expected Result**: Middleware verification fails; cookie is cleared and user is redirected to `/login`.
- **Status**: Pass

### TC-ATH-10: Token Expiration Handling
- **Category**: Authentication
- **Priority**: P2 (High)
- **Pre-conditions**: Expired JWT cookie.
- **Steps**:
  1. Make request with expired session token.
- **Expected Result**: Server returns 401 Unauthorized, prompting re-authentication without application crash.
- **Status**: Pass

---

## 6. Multi-Role RBAC & Seller Onboarding (TC-ROL-01 to TC-ROL-10)

### TC-ROL-01: Default Role Assignment
- **Category**: RBAC
- **Priority**: P1 (Critical)
- **Pre-conditions**: Fresh registration.
- **Steps**:
  1. Inspect user record in database.
- **Expected Result**: User document has `role: "buyer"` and `isApprovedSeller: false`.
- **Status**: Pass

### TC-ROL-02: Buyer Forbidden from Seller Portal
- **Category**: RBAC
- **Priority**: P1 (Critical)
- **Pre-conditions**: Logged in as Scholar (`buyer`).
- **Steps**:
  1. Navigate to `/seller/dashboard`.
- **Expected Result**: System redirects to `/seller/onboarding` prompting seller elevation.
- **Status**: Pass

### TC-ROL-03: Buyer Forbidden from Admin Suite
- **Category**: RBAC
- **Priority**: P1 (Critical)
- **Pre-conditions**: Logged in as Scholar (`buyer`).
- **Steps**:
  1. Navigate to `/admin`.
- **Expected Result**: Redirected to `/login?redirect=%2Fadmin` or denied with 403 Forbidden.
- **Status**: Pass

### TC-ROL-04: Seller Elevation Onboarding Form Validation
- **Category**: RBAC
- **Priority**: P2 (High)
- **Pre-conditions**: Scholar on `/seller/onboarding`.
- **Steps**:
  1. Enter Dealership Name of 1 character ("A").
  2. Click "Register Archival Dealership".
- **Expected Result**: RFC-7807 422 error: "Dealership name must be at least 3 characters long."
- **Status**: Pass

### TC-ROL-05: Successful Seller Elevation
- **Category**: RBAC
- **Priority**: P1 (Critical)
- **Pre-conditions**: Valid dealership data submitted.
- **Steps**:
  1. Enter Name: "Alexandria Rare Folios", Bio: "Specializing in Ptolemaic antiquities."
  2. Submit form.
- **Expected Result**: User role elevated to `"seller"`, new session JWT issued with role `seller`, redirected to `/seller/dashboard`.
- **Status**: Pass

### TC-ROL-06: Seller Dashboard Access
- **Category**: RBAC
- **Priority**: P1 (Critical)
- **Pre-conditions**: Logged in as Archivist (`seller`).
- **Steps**:
  1. Navigate to `/seller/dashboard`.
- **Expected Result**: Dashboard renders inventory statistics, active folios, stock counts, and "Catalog New Manuscript" action.
- **Status**: Pass

### TC-ROL-07: Seller Forbidden from Admin Portal
- **Category**: RBAC
- **Priority**: P1 (Critical)
- **Pre-conditions**: Logged in as Archivist (`seller`).
- **Steps**:
  1. Attempt to navigate to `/admin/users`.
- **Expected Result**: Access blocked; redirected away from admin routes.
- **Status**: Pass

### TC-ROL-08: Admin Hardcoded Security Verification
- **Category**: RBAC
- **Priority**: P1 (Critical)
- **Pre-conditions**: Pre-configured admin account.
- **Steps**:
  1. Attempt to register new account with email `admin@chronicleandquill.com`.
- **Expected Result**: Blocked with 409 Conflict. There is no public path to self-grant admin role.
- **Status**: Pass

### TC-ROL-09: Admin Overseer Full Access
- **Category**: RBAC
- **Priority**: P1 (Critical)
- **Pre-conditions**: Logged in as Curatorial Admin.
- **Steps**:
  1. Navigate to `/admin`, `/admin/orders`, `/admin/books`, `/admin/users`.
- **Expected Result**: All four management portals render with complete access.
- **Status**: Pass

### TC-ROL-10: Anti-BOLA Cross-Seller Modification Guard
- **Category**: RBAC
- **Priority**: P1 (Critical)
- **Pre-conditions**: Seller A owns Manuscript #1. Seller B is logged in.
- **Steps**:
  1. Seller B sends PATCH or DELETE request to `/api/seller/books/[id-of-book-1]`.
- **Expected Result**: Server returns 403 Forbidden. Seller B cannot alter Seller A's inventory.
- **Status**: Pass

---

## 7. Seller Inventory & Image Upload (TC-SEL-01 to TC-SEL-08)

### TC-SEL-01: Manuscript Cataloging with Remote HTTPS URL
- **Category**: Seller Inventory
- **Priority**: P1 (Critical)
- **Pre-conditions**: Authenticated seller on `/seller/books/new`.
- **Steps**:
  1. Fill title, author, era, format, price, stock, and valid Unsplash image URL.
  2. Click "Preserve & Catalog Folio".
- **Expected Result**: Book created with `sellerId`. Book renders in public catalog and seller inventory list.
- **Status**: Pass

### TC-SEL-02: Dual-Mode Cover Selector Tab Switching
- **Category**: Seller Inventory
- **Priority**: P2 (High)
- **Pre-conditions**: Seller on `/seller/books/new`.
- **Steps**:
  1. Toggle between "Upload Local File" and "Remote URL" tabs.
- **Expected Result**: Form inputs switch cleanly between file dropzone and URL text input without state corruption.
- **Status**: Pass

### TC-SEL-03: Local Image File Type Validation
- **Category**: Seller Inventory
- **Priority**: P1 (Critical)
- **Pre-conditions**: Seller on `/seller/books/new`.
- **Steps**:
  1. Select or drop a file with extension `.txt` or `.pdf`.
- **Expected Result**: Upload is rejected with error: "File must be an image (JPEG, PNG, WebP, AVIF)".
- **Status**: Pass

### TC-SEL-04: Local Image File Size Cap (10 MB Guard)
- **Category**: Seller Inventory
- **Priority**: P1 (Critical)
- **Pre-conditions**: Seller on `/seller/books/new`.
- **Steps**:
  1. Upload an image file exceeding 10 MB in size (e.g. 11.2 MB).
- **Expected Result**: Upload fails with RFC-7807 422 error: "File size exceeds strict 10 MB ceiling".
- **Status**: Pass

### TC-SEL-05: Successful Local Image Upload & Binary Serving
- **Category**: Seller Inventory
- **Priority**: P1 (Critical)
- **Pre-conditions**: Valid 2 MB PNG file selected.
- **Steps**:
  1. Upload image.
  2. Inspect API response.
  3. Fetch the returned `imageUrl` (`/api/images/[id]`).
- **Expected Result**: Returns HTTP 201 with image ID. GET `/api/images/[id]` streams binary image with correct `Content-Type: image/png` and caching headers.
- **Status**: Pass

### TC-SEL-06: Image Preview & Remove Action
- **Category**: Seller Inventory
- **Priority**: P3 (Medium)
- **Pre-conditions**: Image uploaded in form.
- **Steps**:
  1. Observe thumbnail preview.
  2. Click "Remove Cover".
- **Expected Result**: Image preview clears and dropzone resets to initial state.
- **Status**: Pass

### TC-SEL-07: Seller Manuscript Edit
- **Category**: Seller Inventory
- **Priority**: P2 (High)
- **Pre-conditions**: Seller owns active manuscript.
- **Steps**:
  1. Navigate to edit page, update price from $45.00 to $49.00.
  2. Save changes.
- **Expected Result**: Catalog and seller dashboard immediately reflect $49.00 price.
- **Status**: Pass

### TC-SEL-08: Soft-Delist Guard on Ordered Manuscript
- **Category**: Seller Inventory
- **Priority**: P1 (Critical)
- **Pre-conditions**: Manuscript has been purchased in an existing order.
- **Steps**:
  1. Seller attempts to delete the manuscript.
- **Expected Result**: Server soft-delists the book (`isDelisted: true`, `stock: 0`) rather than deleting document, preserving historical order referential integrity.
- **Status**: Pass

---

## 8. Curatorial Overseer Admin (TC-ADM-01 to TC-ADM-08)

### TC-ADM-01: Admin Metrics Dashboard Overview
- **Category**: Admin Suite
- **Priority**: P1 (Critical)
- **Pre-conditions**: Logged in as Admin.
- **Steps**:
  1. Navigate to `/admin`.
- **Expected Result**: Displays total historical revenue, total orders count, catalogued folios, registered scholars, and active sellers.
- **Status**: Pass

### TC-ADM-02: Password Hash Omission in User Directory
- **Category**: Admin Suite
- **Priority**: P1 (Critical)
- **Pre-conditions**: Logged in as Admin.
- **Steps**:
  1. Navigate to `/admin/users`.
  2. Inspect Network response payload for `GET /api/admin/users`.
- **Expected Result**: User records contain `id`, `name`, `email`, `role`, and `createdAt`. `passwordHash` is completely omitted from the JSON payload.
- **Status**: Pass

### TC-ADM-03: Admin User Role Elevation / Demotion
- **Category**: Admin Suite
- **Priority**: P2 (High)
- **Pre-conditions**: Admin viewing user list.
- **Steps**:
  1. Change a user's role from "buyer" to "seller".
- **Expected Result**: User document updates in MongoDB; user immediately gains seller dashboard access.
- **Status**: Pass

### TC-ADM-04: Admin Order Status Transition (Pending to Confirmed)
- **Category**: Admin Suite
- **Priority**: P2 (High)
- **Pre-conditions**: Order in status "Pending".
- **Steps**:
  1. Navigate to `/admin/orders`.
  2. Select status "Confirmed" and save.
- **Expected Result**: Order status transitions to "Confirmed" in database.
- **Status**: Pass

### TC-ADM-05: Admin Order Status Transition (Confirmed to Shipped)
- **Category**: Admin Suite
- **Priority**: P2 (High)
- **Pre-conditions**: Order in status "Confirmed".
- **Steps**:
  1. Transition status to "Shipped".
- **Expected Result**: Status updates to "Shipped".
- **Status**: Pass

### TC-ADM-06: Admin Order Status Transition (Shipped to Delivered)
- **Category**: Admin Suite
- **Priority**: P2 (High)
- **Pre-conditions**: Order in status "Shipped".
- **Steps**:
  1. Transition status to "Delivered".
- **Expected Result**: Status updates to "Delivered" (terminal state).
- **Status**: Pass

### TC-ADM-07: Terminal State Guard on Delivered Orders
- **Category**: Admin Suite
- **Priority**: P1 (Critical)
- **Pre-conditions**: Order in terminal status "Delivered".
- **Steps**:
  1. Admin attempts to transition status back to "Pending" or "Confirmed".
- **Expected Result**: Server rejects update with HTTP 400: "Cannot modify an order that has reached terminal status (Delivered)."
- **Status**: Pass

### TC-ADM-08: Terminal State Guard on Cancelled Orders
- **Category**: Admin Suite
- **Priority**: P1 (Critical)
- **Pre-conditions**: Order in terminal status "Cancelled".
- **Steps**:
  1. Admin attempts to change status back to "Shipped".
- **Expected Result**: Server rejects transition with HTTP 400 error.
- **Status**: Pass

---

## 9. Accessibility (WCAG 2.1 AA) (TC-A11-01 to TC-A11-06)

### TC-A11-01: Keyboard Navigation Across Public Header
- **Category**: Accessibility
- **Priority**: P1 (Critical)
- **Pre-conditions**: Keyboard only (Tab, Shift+Tab, Enter, Space).
- **Steps**:
  1. Tab through navigation links, search input, and cart button.
- **Expected Result**: Clear focus rings (gold ring indicator) appear around every active interactive element. No keyboard traps.
- **Status**: Pass

### TC-A11-02: Automated Axe-Core Homepage Audit
- **Category**: Accessibility
- **Priority**: P1 (Critical)
- **Pre-conditions**: Playwright AxeBuilder loaded.
- **Steps**:
  1. Scan `/` against WCAG 2.1 AA rules.
- **Expected Result**: 0 critical, 0 serious violations. Color contrast, image alt texts, and heading hierarchies pass.
- **Status**: Pass

### TC-A11-03: Automated Axe-Core Catalog Stacks Audit
- **Category**: Accessibility
- **Priority**: P1 (Critical)
- **Pre-conditions**: User on `/books`.
- **Steps**:
  1. Scan `/books` with AxeBuilder.
- **Expected Result**: 0 violations. Filter inputs have explicit accessible labels.
- **Status**: Pass

### TC-A11-04: Automated Axe-Core Cart Audit
- **Category**: Accessibility
- **Priority**: P1 (Critical)
- **Pre-conditions**: User on `/cart`.
- **Steps**:
  1. Scan `/cart` with AxeBuilder.
- **Expected Result**: 0 violations. Steppers have explicit `aria-label` attributes.
- **Status**: Pass

### TC-A11-05: Automated Axe-Core Scholar Login Portal Audit
- **Category**: Accessibility
- **Priority**: P1 (Critical)
- **Pre-conditions**: User on `/login`.
- **Steps**:
  1. Scan `/login` with AxeBuilder.
- **Expected Result**: 0 violations. Form controls and demo buttons comply with contrast and labeling standards.
- **Status**: Pass

### TC-A11-06: Color Contrast in Classical Parchment Palette
- **Category**: Accessibility
- **Priority**: P2 (High)
- **Pre-conditions**: Inspect dark ink typography `#1C1917` on light parchment `#FBF9F5`.
- **Steps**:
  1. Calculate color contrast ratio.
- **Expected Result**: Contrast exceeds 14:1, vastly exceeding WCAG AA requirement of 4.5:1 for normal body text.
- **Status**: Pass

---

## 10. Performance & Responsive Matrix (TC-PER-01 to TC-PER-06)

### TC-PER-01: Desktop Viewport Catalog Layout (1440px)
- **Category**: Responsive Matrix
- **Priority**: P1 (Critical)
- **Pre-conditions**: Viewport set to 1440x900.
- **Steps**:
  1. Navigate to `/books`.
- **Expected Result**: Desktop navbar renders, 3-column book card grid displays with filter sidebar alongside.
- **Status**: Pass

### TC-PER-02: Mobile Viewport Catalog Layout (390px)
- **Category**: Responsive Matrix
- **Priority**: P1 (Critical)
- **Pre-conditions**: Viewport set to 390x844 (iPhone / Pixel).
- **Steps**:
  1. Navigate to `/books`.
- **Expected Result**: Filter sidebar collapses into slide-over drawer; cards reflow into a clean single-column layout with no horizontal overflow.
- **Status**: Pass

### TC-PER-03: Mobile Touch Target Sizing (>= 44x44px)
- **Category**: Responsive Matrix
- **Priority**: P2 (High)
- **Pre-conditions**: Mobile viewport active.
- **Steps**:
  1. Inspect button dimensions on mobile navigation toggle, stepper buttons, and checkout submit button.
- **Expected Result**: All interactive tap targets meet or exceed 44x44px.
- **Status**: Pass

### TC-PER-04: Time to First Byte (TTFB) on Core Routes
- **Category**: Performance
- **Priority**: P2 (High)
- **Pre-conditions**: Production build running.
- **Steps**:
  1. Measure TTFB across `/`, `/books`, `/login`, `/cart`.
- **Expected Result**: All routes respond with TTFB under 150ms.
- **Status**: Pass

### TC-PER-05: Image Optimization with Next.js `<Image />`
- **Category**: Performance
- **Priority**: P2 (High)
- **Pre-conditions**: Book cards rendered on `/books`.
- **Steps**:
  1. Inspect network payload for cover images.
- **Expected Result**: Images serve modern WebP/AVIF formats with responsive `sizes` attribute and lazy loading.
- **Status**: Pass

### TC-PER-06: Database Connection Pooling Under Concurrent Load
- **Category**: Performance
- **Priority**: P1 (Critical)
- **Pre-conditions**: 50 concurrent requests sent to `/api/books`.
- **Steps**:
  1. Measure connection pool behavior.
- **Expected Result**: Cached `global._mongoClientPromise` reuses existing pool without exhausting free tier connection limits.
- **Status**: Pass
