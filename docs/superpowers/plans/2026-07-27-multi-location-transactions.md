# Multi-Location Transactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support multi-storage inbound and outbound transactions with one outbound destination and location-grouped carts/history.

**Architecture:** Persist the storage location on each transaction item and use one shared grouping helper in the browser. Keep transaction header locations as compatibility summaries and enforce item/product/location consistency on the server.

**Tech Stack:** Node.js, browser JavaScript, SQLite/libSQL, Drizzle schema metadata, Node assert tests.

---

### Task 1: Regression Checks

**Files:**
- Modify: `test/security.test.js`

- [x] Add a failing source-level/runtime check proving carts no longer reject multiple source/storage locations, outbound still rejects multiple destinations, and transaction items carry `locationId`.
- [x] Run `npm test` and confirm the new check fails because multi-location behavior is absent.

### Task 2: Persist And Validate Item Locations

**Files:**
- Modify: `db/schema.js`
- Modify: `server.js`

- [x] Add nullable migration column `transaction_items.location_id`, backfill it from `products.location_id`, and include it in reads/writes.
- [x] Change stock validation to use `item.locationId`, require a valid storage location matching the product, and require one valid outbound destination.
- [x] Run `npm test` and keep the regression check failing only on browser behavior.

### Task 3: Multi-Location UI And Grouped History

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

- [x] Remove the inbound location selector and derive its location from the selected product.
- [x] Permit multiple inbound storage locations and multiple outbound source locations while locking outbound destination to the first cart item.
- [x] Store `locationId` on transaction items and render cart/history/WhatsApp items grouped by storage location.
- [x] Run `npm test` and confirm all checks pass.

### Task 4: Localhost Verification

**Files:**
- No code changes expected.

- [x] Run `npm test` fresh.
- [x] Start `npm start` on localhost and verify `/health` plus `npm run test:integration`.
- [x] Inspect the final diff and ensure unrelated `graphify-out/` files remain untouched.

### Task 5: Compact History Pagination

**Files:**
- Modify: `app.js`
- Modify: `styles.css`
- Modify: `test/security.test.js`

- [x] Add a failing check for 9-row pagination and page clamping.
- [x] Paginate transaction history with previous/next controls and a page indicator.
- [x] Omit the repeated expanded location heading when the transaction has one location.
- [x] Run unit, integration, and localhost UI verification.
