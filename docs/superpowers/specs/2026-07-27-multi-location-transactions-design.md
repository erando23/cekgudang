# Multi-Location Transactions Design

## Goal

Allow one inventory transaction to contain items from multiple storage locations while keeping stock updates and history tied to the exact location used at transaction time.

## Rules

- Inbound location is locked to each product's storage location. Users select only the product and quantity; only an Admin can change a product's storage location through master data.
- Outbound items may come from different storage locations, but every item in one transaction must share one destination.
- Stock continues to increase or decrease at the item's storage location.
- Temporary inbound lists are grouped by destination storage location.
- Temporary outbound lists are grouped by source storage location.
- Transaction history uses the same grouping rules.

## Data Model

Add `locationId` to each transaction item and persist it as `transaction_items.location_id`. Existing rows are backfilled from the product's current storage location during migration. Transaction header location fields remain for backward compatibility and summary display: inbound uses a source location only when all items share one location; outbound always stores the single destination and stores a source only when all items share one source.

## Validation

The server verifies that every item location is a valid storage location, matches the product's configured location, and matches the stock row being changed. For outbound, it also verifies that the transaction has one valid destination.

## UI And History

Inbound removes the editable location selector and derives location from the chosen product. Outbound keeps source selection for finding products and locks the destination after the first cart item until the cart is emptied. Shared grouping markup renders cart items, history cards, item history labels, and WhatsApp transaction text by item location.

Transaction history shows at most 9 transactions per page with previous/next controls and a page indicator. Each card shows five item rows before `Lihat selengkapnya`. When a transaction uses only one storage location, the expanded section continues the item list without repeating the location heading.

## Verification

Add one runnable Node test covering multi-location grouping and server-side transaction validation, run `npm test`, then start `npm start` and run the HTTP integration test against localhost.
