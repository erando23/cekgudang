const { integer, real, sqliteTable, text, primaryKey } = require("drizzle-orm/sqlite-core");

const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
});

const locations = sqliteTable("locations", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(),
});

const products = sqliteTable("products", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull(),
  minStock: integer("min_stock").notNull().default(0),
  locationId: integer("location_id").notNull().references(() => locations.id),
  active: integer("active").notNull().default(1),
});

const productStocks = sqliteTable(
  "product_stocks",
  {
    productId: integer("product_id").notNull().references(() => products.id),
    locationId: integer("location_id").notNull().references(() => locations.id),
    quantity: integer("quantity").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.locationId] }),
  }),
);

const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  sourceLocationId: integer("source_location_id").references(() => locations.id),
  destLocationId: integer("dest_location_id").references(() => locations.id),
  createdAt: text("created_at").notNull(),
});

const transactionItems = sqliteTable("transaction_items", {
  id: integer("id").primaryKey(),
  transactionId: text("transaction_id").notNull().references(() => transactions.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
});

const purchaseRecords = sqliteTable("purchase_records", {
  id: text("id").primaryKey(),
  outletLocationId: integer("outlet_location_id").notNull().references(() => locations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  note: text("note"),
  type: text("type").notNull(),
  createdAt: text("created_at").notNull(),
});

const purchaseItems = sqliteTable("purchase_items", {
  id: integer("id").primaryKey(),
  purchaseId: text("purchase_id").notNull().references(() => purchaseRecords.id),
  productId: integer("product_id").references(() => products.id),
  freeName: text("free_name"),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  unitPrice: real("unit_price").notNull(),
  subtotal: real("subtotal").notNull(),
});

module.exports = {
  users,
  locations,
  products,
  productStocks,
  transactions,
  transactionItems,
  purchaseRecords,
  purchaseItems,
};
