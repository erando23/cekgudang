const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@libsql/client");
const ExcelJS = require("exceljs");

const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SESSION_COOKIE = "cekgudang_session";
const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const SESSION_SECRET = process.env.SESSION_SECRET || "cekgudang-local-session-secret";
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const LEGACY_JSON_FILE = path.join(DATA_DIR, "db.json");
const LOCAL_DB_URL = "file:data/cekgudang.db";

if (IS_PRODUCTION && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET wajib diisi pada production.");
}
if (IS_PRODUCTION && (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN)) {
  throw new Error("TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN wajib diisi pada production.");
}

function accountPassword(name, fallback) {
  if (IS_PRODUCTION && !process.env[name]) throw new Error(`${name} wajib diisi pada production.`);
  return process.env[name] || fallback;
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || LOCAL_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const loginAttempts = new Map();

const seedState = {
  users: [
    { id: 1, name: "Erando", username: "erando23", password: accountPassword("ADMIN_PASSWORD", "erando23"), role: "ADMIN" },
    { id: 2, name: "Vivi", username: "vivi", password: accountPassword("ACCOUNTANT_PASSWORD", "vivi2468"), role: "AKUNTAN" },
    { id: 3, name: "Lusi", username: "lusi", password: accountPassword("STAFF_PASSWORD", "lusi1357"), role: "STAFF" },
  ],
  locations: [
    { id: 1, name: "Gudang Utama", type: "STORAGE" },
    { id: 2, name: "Freezer A", type: "STORAGE" },
    { id: 3, name: "Freezer B", type: "STORAGE" },
    { id: 4, name: "Freezer C", type: "STORAGE" },
    { id: 5, name: "Dapur Produksi", type: "DESTINATION" },
    { id: 6, name: "SUGI Ramen", type: "DESTINATION" },
    { id: 7, name: "Garam Resto", type: "DESTINATION" },
  ],
  products: [
    { id: 1, name: "Telur", unit: "tray", minStock: 10, locationId: 1, active: true },
    { id: 2, name: "Minyak Goreng", unit: "pcs", minStock: 8, locationId: 1, active: true },
    { id: 3, name: "Tepung Terigu", unit: "kg", minStock: 15, locationId: 1, active: true },
    { id: 4, name: "Daging Slice", unit: "pack", minStock: 12, locationId: 2, active: true },
    { id: 5, name: "Ayam Fillet", unit: "kg", minStock: 10, locationId: 2, active: true },
  ],
  productStocks: [
    { productId: 1, locationId: 1, quantity: 24 },
    { productId: 2, locationId: 1, quantity: 9 },
    { productId: 3, locationId: 1, quantity: 13 },
    { productId: 4, locationId: 2, quantity: 8 },
    { productId: 5, locationId: 2, quantity: 6 },
  ],
  transactions: [],
  transactionItems: [],
  purchaseRecords: [],
  purchaseItems: [],
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".wasm": "application/wasm",
};

const publicFiles = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/app.js", "app.js"],
  ["/styles.css", "styles.css"],
  ["/template-nota-belanja.csv", "template-nota-belanja.csv"],
]);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, storedPassword) {
  const [, salt, storedHash] = String(storedPassword || "").split("$");
  if (!salt || !storedHash) return false;
  const actualHash = crypto.scryptSync(String(password), salt, 64);
  const expectedHash = Buffer.from(storedHash, "hex");
  return actualHash.length === expectedHash.length && crypto.timingSafeEqual(actualHash, expectedHash);
}

function createSessionToken(userId, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ userId, loggedInAt: new Date(now).toISOString(), exp: now + SESSION_TTL_MS })).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readSessionToken(token, now = Date.now()) {
  try {
    const [payload, signature] = String(token || "").split(".");
    if (!payload || !signature) return null;
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(session.userId) > 0 && Number(session.exp) > now ? session : null;
  } catch {
    return null;
  }
}

function requestSession(request) {
  const cookies = Object.fromEntries(
    String(request.headers.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim().split("="))
      .filter(([name]) => name),
  );
  return readSessionToken(cookies[SESSION_COOKIE]);
}

function setSessionCookie(response, token) {
  const secure = IS_PRODUCTION ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
}

function clearSessionCookie(response) {
  const secure = IS_PRODUCTION ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
}

async function authenticatedUser(request) {
  const session = requestSession(request);
  if (!session) return null;
  const result = await db.execute({
    sql: "SELECT id, name, username, role FROM users WHERE id = ?",
    args: [session.userId],
  });
  const row = result.rows[0];
  return row
    ? { session, user: { id: Number(row.id), name: row.name, username: row.username, role: row.role } }
    : null;
}

function loginAttemptKey(request, username) {
  // ponytail: in-memory limiter is enough for one instance; use a shared store when scaling horizontally.
  return `${request.socket.remoteAddress || "unknown"}:${username.toLowerCase()}`;
}

function loginRateLimit(request, username) {
  const key = loginAttemptKey(request, username);
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 0, resetAt: now + LOGIN_WINDOW_MS });
    return { allowed: true, key };
  }
  return { allowed: current.count < LOGIN_MAX_ATTEMPTS, key, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}

function recordLoginFailure(key) {
  const current = loginAttempts.get(key) || { count: 0, resetAt: Date.now() + LOGIN_WINDOW_MS };
  current.count += 1;
  loginAttempts.set(key, current);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
}

function normalizeState(rawState) {
  const state = structuredClone(rawState);
  state.users ||= [];
  state.locations ||= [];
  state.products ||= [];
  state.productStocks ||= [];
  state.transactions ||= [];
  state.transactionItems ||= [];
  state.purchaseRecords ||= [];
  state.purchaseItems ||= [];

  state.products = state.products.map((product) => {
    if (product.locationId) return product;
    const stockRows = state.productStocks.filter((stock) => stock.productId === product.id && Number(stock.quantity) > 0);
    const fallbackStock = state.productStocks.find((stock) => stock.productId === product.id);
    return { ...product, locationId: stockRows[0]?.locationId || fallbackStock?.locationId || 1 };
  });

  state.productStocks = state.products.map((product) => {
    const quantity = state.productStocks
      .filter((stock) => stock.productId === product.id)
      .reduce((sum, stock) => sum + Number(stock.quantity), 0);
    return { productId: product.id, locationId: product.locationId, quantity };
  });

  state.transactionItems = state.transactionItems.map((item) => ({
    ...item,
    locationId: Number(item.locationId || state.products.find((product) => product.id === Number(item.productId))?.locationId || 0),
  }));

  state.purchaseItems = state.purchaseItems.map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    return {
      ...item,
      productId: item.productId == null || item.productId === "" ? null : Number(item.productId),
      freeName: item.freeName || null,
      quantity,
      unitPrice,
      subtotal: quantity * unitPrice,
    };
  });

  return state;
}

async function initDb() {
  if (!process.env.TURSO_DATABASE_URL) ensureDataDir();
  await db.execute("PRAGMA foreign_keys = ON");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'AKUNTAN'))
    )
  `);
  await migrateUserRoleConstraint();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type IN ('STORAGE', 'DESTINATION'))
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      unit TEXT NOT NULL,
      min_stock INTEGER NOT NULL DEFAULT 0,
      location_id INTEGER NOT NULL REFERENCES locations(id),
      active INTEGER NOT NULL DEFAULT 1
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_stocks (
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      location_id INTEGER NOT NULL REFERENCES locations(id),
      quantity INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (product_id, location_id)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('INBOUND', 'OUTBOUND')),
      user_id INTEGER NOT NULL REFERENCES users(id),
      source_location_id INTEGER REFERENCES locations(id),
      dest_location_id INTEGER REFERENCES locations(id),
      created_at TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY,
      transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      location_id INTEGER REFERENCES locations(id),
      quantity INTEGER NOT NULL
    )
  `);
  await migrateTransactionItemLocations();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS purchase_records (
      id TEXT PRIMARY KEY,
      outlet_location_id INTEGER NOT NULL REFERENCES locations(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      note TEXT,
      type TEXT NOT NULL CHECK (type IN ('PURCHASE', 'ADJUSTMENT')),
      created_at TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY,
      purchase_id TEXT NOT NULL REFERENCES purchase_records(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      free_name TEXT,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL
    )
  `);
  await db.execute("INSERT OR IGNORE INTO app_meta (key, value) VALUES ('state_revision', 0)");

  const userCount = await db.execute("SELECT COUNT(*) AS count FROM users");
  const shouldSeed = Number(userCount.rows[0].count) === 0;
  await syncApplicationUsers();
  if (shouldSeed) {
    const legacyState = fs.existsSync(LEGACY_JSON_FILE)
      ? JSON.parse(fs.readFileSync(LEGACY_JSON_FILE, "utf8"))
      : seedState;
    await writeState(normalizeState(legacyState), null);
  }
}

async function syncApplicationUsers() {
  for (const user of seedState.users) {
    const existing = await db.execute({ sql: "SELECT password FROM users WHERE id = ?", args: [user.id] });
    const storedPassword = String(existing.rows[0]?.password || "");
    const passwordHash = verifyPassword(user.password, storedPassword) ? storedPassword : hashPassword(user.password);
    await exec(
      `INSERT INTO users (id, name, username, password, role)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         username = excluded.username,
         password = excluded.password,
         role = excluded.role`,
      [user.id, user.name, user.username, passwordHash, user.role],
    );
  }
  await exec("DELETE FROM users WHERE username IN ('admin', 'staff')");
}

async function migrateUserRoleConstraint() {
  const table = await db.execute("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'");
  const createSql = String(table.rows[0]?.sql || "");
  if (!createSql || createSql.includes("AKUNTAN")) return;

  await db.execute("PRAGMA foreign_keys = OFF");
  await db.execute("BEGIN TRANSACTION");
  try {
    await db.execute(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'AKUNTAN'))
      )
    `);
    await db.execute(`
      INSERT INTO users_new (id, name, username, password, role)
      SELECT id, name, username, password,
        CASE WHEN role IN ('ADMIN', 'STAFF', 'AKUNTAN') THEN role ELSE 'STAFF' END
      FROM users
    `);
    await db.execute("DROP TABLE users");
    await db.execute("ALTER TABLE users_new RENAME TO users");
    await db.execute("COMMIT");
  } catch (error) {
    await db.execute("ROLLBACK");
    throw error;
  } finally {
    await db.execute("PRAGMA foreign_keys = ON");
  }
}

async function migrateTransactionItemLocations() {
  const columns = await db.execute("PRAGMA table_info(transaction_items)");
  if (!columns.rows.some((column) => column.name === "location_id")) {
    await db.execute("ALTER TABLE transaction_items ADD COLUMN location_id INTEGER REFERENCES locations(id)");
  }
  await db.execute(`
    UPDATE transaction_items
    SET location_id = (SELECT location_id FROM products WHERE products.id = transaction_items.product_id)
    WHERE location_id IS NULL
  `);
}

async function readState(executor = db) {
  const statements = [
    "SELECT value FROM app_meta WHERE key = 'state_revision'",
    "SELECT id, name, username, role FROM users ORDER BY id",
    "SELECT id, name, type FROM locations ORDER BY id",
    "SELECT id, name, unit, min_stock, location_id, active FROM products ORDER BY id",
    "SELECT product_id, location_id, quantity FROM product_stocks ORDER BY product_id, location_id",
    "SELECT id, type, user_id, source_location_id, dest_location_id, created_at FROM transactions ORDER BY created_at, id",
    "SELECT id, transaction_id, product_id, location_id, quantity FROM transaction_items ORDER BY id",
    "SELECT id, outlet_location_id, user_id, date, note, type, created_at FROM purchase_records ORDER BY date, created_at, id",
    "SELECT id, purchase_id, product_id, free_name, quantity, unit, unit_price, subtotal FROM purchase_items ORDER BY id",
  ];
  const results = executor === db ? await executor.batch(statements, "read") : await executor.batch(statements);
  const [revision, users, locations, products, productStocks, transactions, transactionItems, purchaseRecords, purchaseItems] = results;

  return {
    revision: Number(revision.rows[0]?.value || 0),
    users: users.rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      username: row.username,
      role: row.role,
    })),
    locations: locations.rows.map((row) => ({ id: Number(row.id), name: row.name, type: row.type })),
    products: products.rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      unit: row.unit,
      minStock: Number(row.min_stock),
      locationId: Number(row.location_id),
      active: Boolean(row.active),
    })),
    productStocks: productStocks.rows.map((row) => ({
      productId: Number(row.product_id),
      locationId: Number(row.location_id),
      quantity: Number(row.quantity),
    })),
    transactions: transactions.rows.map((row) => ({
      id: row.id,
      type: row.type,
      userId: Number(row.user_id),
      sourceLocationId: row.source_location_id == null ? null : Number(row.source_location_id),
      destLocationId: row.dest_location_id == null ? null : Number(row.dest_location_id),
      createdAt: row.created_at,
    })),
    transactionItems: transactionItems.rows.map((row) => ({
      id: Number(row.id),
      transactionId: row.transaction_id,
      productId: Number(row.product_id),
      locationId: Number(row.location_id),
      quantity: Number(row.quantity),
    })),
    purchaseRecords: purchaseRecords.rows.map((row) => ({
      id: row.id,
      outletLocationId: Number(row.outlet_location_id),
      userId: Number(row.user_id),
      date: row.date,
      note: row.note || "",
      type: row.type,
      createdAt: row.created_at,
    })),
    purchaseItems: purchaseItems.rows.map((row) => ({
      id: Number(row.id),
      purchaseId: row.purchase_id,
      productId: row.product_id == null ? null : Number(row.product_id),
      freeName: row.free_name || null,
      quantity: Number(row.quantity),
      unit: row.unit,
      unitPrice: Number(row.unit_price),
      subtotal: Number(row.subtotal),
    })),
  };
}

async function exec(sql, args = []) {
  await db.execute({ sql, args });
}

function assertStateRevision(expectedRevision, currentRevision) {
  if (expectedRevision === null) return;
  if (!Number.isInteger(expectedRevision) || expectedRevision !== currentRevision) {
    const error = new Error("Data telah berubah sejak terakhir dimuat.");
    error.code = "STATE_CONFLICT";
    error.currentRevision = currentRevision;
    throw error;
  }
}

function stateError(message, code = "STATE_FORBIDDEN") {
  const error = new Error(message);
  error.code = code;
  return error;
}

function stable(value) {
  return JSON.stringify(value);
}

function assertRowsUnchanged(currentRows, nextRows, key, label) {
  const nextByKey = new Map(nextRows.map((row) => [String(row[key]), stable(row)]));
  for (const row of currentRows) {
    if (nextByKey.get(String(row[key])) !== stable(row)) throw stateError(`${label} tidak boleh diubah pada operasi ini.`);
  }
}

function assertSectionUnchanged(currentState, nextState, key) {
  const currentRows = currentState[key] || [];
  const nextRows = nextState[key] || [];
  if (currentRows.length !== nextRows.length) throw stateError(`Bagian ${key} tidak boleh diubah pada operasi ini.`);
  assertRowsUnchanged(currentRows, nextRows, key === "productStocks" ? "productId" : "id", key);
}

function assertAppend(currentRows, nextRows, key, count, label) {
  assertRowsUnchanged(currentRows, nextRows, key, label);
  if (nextRows.length !== currentRows.length + count) throw stateError(`Jumlah ${label} tidak valid.`);
}

function assertAppendAtLeast(currentRows, nextRows, key, label) {
  assertRowsUnchanged(currentRows, nextRows, key, label);
  if (nextRows.length <= currentRows.length) throw stateError(`Tidak ada ${label} baru.`);
}

function assertStockChanges(currentState, nextState, operation, items) {
  const currentByKey = new Map(currentState.productStocks.map((row) => [`${row.productId}:${row.locationId}`, Number(row.quantity)]));
  const expectedDelta = new Map();
  for (const item of items) {
    const product = currentState.products.find((row) => row.id === Number(item.productId));
    if (!product) throw stateError("Produk transaksi tidak ditemukan.");
    const locationId = Number(item.locationId);
    const location = currentState.locations.find((row) => row.id === locationId);
    if (location?.type !== "STORAGE" || Number(product.locationId) !== locationId) {
      throw stateError("Lokasi item transaksi tidak valid.");
    }
    const key = `${product.id}:${locationId}`;
    const delta = operation === "inbound" ? Number(item.quantity) : -Number(item.quantity);
    expectedDelta.set(key, (expectedDelta.get(key) || 0) + delta);
  }
  const nextByKey = new Map(nextState.productStocks.map((row) => [`${row.productId}:${row.locationId}`, Number(row.quantity)]));
  for (const [key, currentQuantity] of currentByKey) {
    const expected = currentQuantity + (expectedDelta.get(key) || 0);
    if (operation === "outbound" && expected < 0) throw stateError("Stok lokasi tidak cukup.");
    if (nextByKey.get(key) !== expected) throw stateError("Perubahan stok tidak sesuai dengan item transaksi.");
  }
  if (nextByKey.size !== currentByKey.size) throw stateError("Jumlah baris stok tidak valid.");
}

function validateStateOperation(currentState, nextState, operation, user) {
  const role = user?.role;
  if (!operation) throw stateError("Operasi state wajib diisi.", "STATE_OPERATION_REQUIRED");
  if (!["ADMIN", "STAFF", "AKUNTAN"].includes(role)) throw stateError("Role tidak valid.", "STATE_FORBIDDEN");

  if (operation === "product-create") {
    assertSectionUnchanged(currentState, nextState, "locations");
    assertSectionUnchanged(currentState, nextState, "transactions");
    assertSectionUnchanged(currentState, nextState, "transactionItems");
    assertSectionUnchanged(currentState, nextState, "purchaseRecords");
    assertSectionUnchanged(currentState, nextState, "purchaseItems");
    assertAppend(currentState.products, nextState.products, "id", 1, "produk");
    assertAppend(currentState.productStocks, nextState.productStocks, "productId", 1, "stok");
    const product = nextState.products.find((row) => !currentState.products.some((current) => current.id === row.id));
    const stock = nextState.productStocks.find((row) => !currentState.productStocks.some((current) => current.productId === row.productId));
    const location = currentState.locations.find((row) => row.id === Number(product?.locationId));
    if (!product || !stock || !product.name || !product.unit || product.active === false || location?.type !== "STORAGE") {
      throw stateError("Produk baru tidak valid.");
    }
    if (stock.productId !== product.id || stock.locationId !== product.locationId || Number(stock.quantity) !== 0) {
      throw stateError("Stok awal produk baru harus nol di lokasi penyimpanannya.");
    }
    if (role !== "ADMIN" && Number(product.minStock) !== 0) throw stateError("Staff/Akuntan tidak boleh mengatur minimum stok.");
    return;
  }

  if (operation === "product-update" || operation === "product-deactivate") {
    if (role !== "ADMIN") throw stateError("Hanya Admin yang boleh mengubah master barang.");
    assertSectionUnchanged(currentState, nextState, "locations");
    assertSectionUnchanged(currentState, nextState, "transactions");
    assertSectionUnchanged(currentState, nextState, "transactionItems");
    assertSectionUnchanged(currentState, nextState, "purchaseRecords");
    assertSectionUnchanged(currentState, nextState, "purchaseItems");
    if (currentState.products.length !== nextState.products.length) throw stateError("Jumlah produk tidak valid.");
    const changedProducts = currentState.products.filter((row) => stable(row) !== stable(nextState.products.find((next) => next.id === row.id))).length;
    if (changedProducts !== 1) throw stateError("Hanya satu produk boleh diubah per operasi.");
    const changed = currentState.products.find((row) => stable(row) !== stable(nextState.products.find((next) => next.id === row.id)));
    const updated = nextState.products.find((row) => row.id === changed?.id);
    const updatedLocation = currentState.locations.find((row) => row.id === Number(updated?.locationId));
    if (!updated || updatedLocation?.type !== "STORAGE") throw stateError("Lokasi produk harus berupa penyimpanan.");
    if (operation === "product-deactivate") {
      if (!changed || !updated || changed.active === false || updated.active !== false) throw stateError("Operasi nonaktifkan produk tidak valid.");
      assertSectionUnchanged(currentState, nextState, "productStocks");
    } else {
      if (currentState.productStocks.length !== nextState.productStocks.length) throw stateError("Jumlah stok tidak valid.");
      const currentStock = currentState.productStocks.find((row) => row.productId === changed?.id);
      const nextStock = nextState.productStocks.find((row) => row.productId === changed?.id);
      assertRowsUnchanged(
        currentState.productStocks.filter((row) => row.productId !== changed?.id),
        nextState.productStocks.filter((row) => row.productId !== changed?.id),
        "productId",
        "stok lain",
      );
      if (!currentStock || !nextStock || nextStock.locationId !== updated?.locationId || Number(nextStock.quantity) !== Number(currentStock.quantity)) {
        throw stateError("Perubahan lokasi stok tidak valid.");
      }
    }
    return;
  }

  if (operation === "import") {
    if (role !== "ADMIN") throw stateError("Hanya Admin yang boleh mengimpor barang.");
    assertSectionUnchanged(currentState, nextState, "locations");
    assertSectionUnchanged(currentState, nextState, "transactions");
    assertSectionUnchanged(currentState, nextState, "transactionItems");
    assertSectionUnchanged(currentState, nextState, "purchaseRecords");
    assertSectionUnchanged(currentState, nextState, "purchaseItems");
    assertAppendAtLeast(currentState.products, nextState.products, "id", "produk");
    assertAppendAtLeast(currentState.productStocks, nextState.productStocks, "productId", "stok");
    const importedProducts = nextState.products.filter((row) => !currentState.products.some((current) => current.id === row.id));
    if (importedProducts.some((product) => currentState.locations.find((location) => location.id === Number(product.locationId))?.type !== "STORAGE")) {
      throw stateError("Semua produk import harus berada di lokasi penyimpanan.");
    }
    return;
  }

  if (operation === "inbound" || operation === "outbound") {
    assertSectionUnchanged(currentState, nextState, "locations");
    assertSectionUnchanged(currentState, nextState, "products");
    assertSectionUnchanged(currentState, nextState, "purchaseRecords");
    assertSectionUnchanged(currentState, nextState, "purchaseItems");
    assertAppend(currentState.transactions, nextState.transactions, "id", 1, "transaksi");
    assertAppendAtLeast(currentState.transactionItems, nextState.transactionItems, "id", "item transaksi");
    const transaction = nextState.transactions.find((row) => !currentState.transactions.some((current) => current.id === row.id));
    if (!transaction || transaction.type !== operation.toUpperCase() || Number(transaction.userId) !== Number(user.id)) throw stateError("Transaksi tidak valid.");
    const currentItemIds = new Set(currentState.transactionItems.map((row) => String(row.id)));
    const addedItems = nextState.transactionItems.filter((row) => !currentItemIds.has(String(row.id)));
    if (addedItems.some((row) => row.transactionId !== transaction.id)) throw stateError("Item transaksi tambahan tidak valid.");
    const items = addedItems;
    if (!items.length || items.some((item) => Number(item.quantity) <= 0)) throw stateError("Item transaksi tidak valid.");
    const itemLocationIds = new Set(items.map((item) => Number(item.locationId)));
    const sourceLocationId = transaction.sourceLocationId == null ? null : Number(transaction.sourceLocationId);
    const destination = currentState.locations.find((row) => row.id === Number(transaction.destLocationId));
    if (sourceLocationId !== (itemLocationIds.size === 1 ? [...itemLocationIds][0] : null)) {
      throw stateError("Ringkasan lokasi asal transaksi tidak valid.");
    }
    if (operation === "outbound" ? destination?.type !== "DESTINATION" : transaction.destLocationId != null) {
      throw stateError("Tujuan transaksi tidak valid.");
    }
    assertStockChanges(currentState, nextState, operation, items);
    return;
  }

  if (operation === "purchase") {
    if (!["ADMIN", "AKUNTAN"].includes(role)) throw stateError("Hanya Admin/Akuntan yang boleh mencatat belanja.");
    assertSectionUnchanged(currentState, nextState, "locations");
    assertSectionUnchanged(currentState, nextState, "products");
    assertSectionUnchanged(currentState, nextState, "productStocks");
    assertSectionUnchanged(currentState, nextState, "transactions");
    assertSectionUnchanged(currentState, nextState, "transactionItems");
    assertAppend(currentState.purchaseRecords, nextState.purchaseRecords, "id", 1, "catatan belanja");
    assertAppendAtLeast(currentState.purchaseItems, nextState.purchaseItems, "id", "item belanja");
    const record = nextState.purchaseRecords.find((row) => !currentState.purchaseRecords.some((current) => current.id === row.id));
    const currentItemIds = new Set(currentState.purchaseItems.map((row) => String(row.id)));
    const addedItems = nextState.purchaseItems.filter((row) => !currentItemIds.has(String(row.id)));
    if (addedItems.some((row) => row.purchaseId !== record?.id)) throw stateError("Item belanja tambahan tidak valid.");
    const items = addedItems;
    if (!record || Number(record.userId) !== Number(user.id) || !items.length) throw stateError("Catatan belanja tidak valid.");
    return;
  }

  throw stateError("Operasi state tidak dikenal.", "STATE_OPERATION_REQUIRED");
}

async function writeState(inputState, expectedRevision, operation, user) {
  // ponytail: revision-safe whole-state writes; split into mutation endpoints if write volume grows.
  const state = normalizeState(inputState);
  const transaction = await db.transaction("write");
  try {
    const currentState = await readState(transaction);
    const currentRevision = currentState.revision;
    assertStateRevision(expectedRevision, currentRevision);
    if (expectedRevision !== null) validateStateOperation(currentState, state, operation, user);
    const nextRevision = currentRevision + 1;
    const statements = [
      { sql: "DELETE FROM transaction_items", args: [] },
      { sql: "DELETE FROM purchase_items", args: [] },
      { sql: "DELETE FROM purchase_records", args: [] },
      { sql: "DELETE FROM transactions", args: [] },
      { sql: "DELETE FROM product_stocks", args: [] },
      { sql: "DELETE FROM products", args: [] },
      { sql: "DELETE FROM locations", args: [] },
    ];
    for (const location of state.locations) {
      statements.push({
        sql: "INSERT INTO locations (id, name, type) VALUES (?, ?, ?)",
        args: [location.id, location.name, location.type],
      });
    }
    for (const product of state.products) {
      statements.push({
        sql: "INSERT INTO products (id, name, unit, min_stock, location_id, active) VALUES (?, ?, ?, ?, ?, ?)",
        args: [product.id, product.name, product.unit, product.minStock, product.locationId, product.active === false ? 0 : 1],
      });
    }
    for (const stock of state.productStocks) {
      statements.push({
        sql: "INSERT INTO product_stocks (product_id, location_id, quantity) VALUES (?, ?, ?)",
        args: [stock.productId, stock.locationId, stock.quantity],
      });
    }
    for (const record of state.transactions) {
      statements.push({
        sql: "INSERT INTO transactions (id, type, user_id, source_location_id, dest_location_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [record.id, record.type, record.userId, record.sourceLocationId, record.destLocationId, record.createdAt],
      });
    }
    for (const item of state.transactionItems) {
      statements.push({
        sql: "INSERT INTO transaction_items (id, transaction_id, product_id, location_id, quantity) VALUES (?, ?, ?, ?, ?)",
        args: [item.id, item.transactionId, item.productId, item.locationId, item.quantity],
      });
    }
    for (const record of state.purchaseRecords) {
      statements.push({
        sql: "INSERT INTO purchase_records (id, outlet_location_id, user_id, date, note, type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [record.id, record.outletLocationId, record.userId, record.date, record.note || "", record.type || "PURCHASE", record.createdAt],
      });
    }
    for (const item of state.purchaseItems) {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      statements.push({
        sql: "INSERT INTO purchase_items (id, purchase_id, product_id, free_name, quantity, unit, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [item.id, item.purchaseId, item.productId || null, item.freeName || null, quantity, item.unit, unitPrice, quantity * unitPrice],
      });
    }
    statements.push({
      sql: "UPDATE app_meta SET value = ? WHERE key = 'state_revision'",
      args: [nextRevision],
    });
    await transaction.batch(statements);
    await transaction.commit();
    return nextRevision;
  } catch (error) {
    await transaction.rollback().catch(() => {});
    throw error;
  } finally {
    transaction.close();
  }
}

function setSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function readRequestBuffer(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      chunks.push(chunk);
      size += chunk.length;
      if (size > 5_000_000) {
        request.destroy();
        reject(new Error("File Excel terlalu besar"));
      }
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function sendExcel(response, filename, buffer) {
  response.writeHead(200, {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": buffer.length,
  });
  response.end(buffer);
}

function sendExcelHead(response, filename, buffer) {
  response.writeHead(200, {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": buffer.length,
  });
  response.end();
}

async function createImportTemplate() {
  const workbook = new ExcelJS.Workbook();
  const rows = [
    ["Nama Barang", "Satuan", "Min Stok", "Stok Saat Ini", "Lokasi"],
    ["Saus Tare", "liter", 5, 12, "Gudang Utama"],
    ["Nori", "pack", 10, 25, "Freezer A"],
  ];
  const sheet = workbook.addWorksheet("Template Barang");
  sheet.addRows(rows);
  [28, 14, 12, 16, 22].forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });

  const locationRows = [
    ["Lokasi Penyimpanan Valid"],
    ["Gudang Utama"],
    ["Freezer A"],
    ["Freezer B"],
    ["Freezer C"],
  ];
  const locationSheet = workbook.addWorksheet("Referensi Lokasi");
  locationSheet.addRows(locationRows);
  locationSheet.getColumn(1).width = 28;

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function getExcelValue(row, names) {
  const keys = Object.keys(row);
  const match = keys.find((key) => names.includes(String(key).trim().toLowerCase()));
  return match ? String(row[match] ?? "").trim() : "";
}

async function previewExcelImport(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const firstSheet = workbook.worksheets[0];
  if (!firstSheet) return [];

  const headers = Array.from({ length: firstSheet.columnCount }, (_, index) => firstSheet.getRow(1).getCell(index + 1).text.trim());
  const rows = [];
  firstSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = Object.fromEntries(headers.map((header, index) => [header, row.getCell(index + 1).text.trim()]));
    if (Object.values(values).some(Boolean)) rows.push(values);
  });
  const state = await readState();
  const storageLocations = state.locations.filter((location) => location.type === "STORAGE");
  const seenNames = new Set();

  return rows.map((row) => {
    const name = getExcelValue(row, ["nama barang", "nama", "barang"]);
    const unit = getExcelValue(row, ["satuan", "unit"]);
    const minStockRaw = getExcelValue(row, ["min stok", "minimal stok", "min_stock", "minstock"]);
    const quantityRaw = getExcelValue(row, ["stok saat ini", "stok", "jumlah", "quantity"]);
    const locationName = getExcelValue(row, ["lokasi", "lokasi penyimpanan", "location"]) || storageLocations[0]?.name || "";
    const minStock = Number(minStockRaw || 0);
    const quantity = Number(quantityRaw || 0);
    const location = storageLocations.find((item) => item.name.toLowerCase() === locationName.toLowerCase());
    const duplicate = state.products.some((product) => product.name.toLowerCase() === name.toLowerCase() && product.active !== false);
    const duplicateInFile = seenNames.has(name.toLowerCase());
    if (name) seenNames.add(name.toLowerCase());

    let error = "";
    if (!name || !unit) error = "Nama/satuan kosong";
    else if (Number.isNaN(minStock) || minStock < 0) error = "Min stok invalid";
    else if (Number.isNaN(quantity) || quantity < 0) error = "Stok invalid";
    else if (!location) error = "Lokasi tidak ada";
    else if (duplicate) error = "Duplikat master";
    else if (duplicateInFile) error = "Duplikat file";

    return {
      name,
      unit,
      minStock: Number.isNaN(minStock) ? 0 : minStock,
      quantity: Number.isNaN(quantity) ? 0 : quantity,
      locationName,
      locationId: location ? location.id : null,
      valid: !error,
      error,
    };
  });
}

async function handleApi(request, response, pathname) {
  if (pathname === "/api/import-template" && (request.method === "GET" || request.method === "HEAD")) {
    const template = await createImportTemplate();
    if (request.method === "HEAD") sendExcelHead(response, "template-master-barang.xlsx", template);
    else sendExcel(response, "template-master-barang.xlsx", template);
    return;
  }

  if (pathname === "/api/login" && request.method === "POST") {
    const body = JSON.parse(await readRequestBody(request));
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const rate = loginRateLimit(request, username);
    if (!rate.allowed) {
      response.setHeader("Retry-After", rate.retryAfter);
      sendJson(response, 429, { error: "Terlalu banyak percobaan login. Coba lagi nanti." });
      return;
    }
    const result = await db.execute({
      sql: "SELECT id, name, username, password, role FROM users WHERE username = ?",
      args: [username],
    });
    const row = result.rows[0];
    if (!row || !verifyPassword(password, row.password)) {
      recordLoginFailure(rate.key);
      sendJson(response, 401, { error: "Username atau password tidak sesuai." });
      return;
    }
    loginAttempts.delete(rate.key);
    const token = createSessionToken(Number(row.id));
    const session = readSessionToken(token);
    setSessionCookie(response, token);
    sendJson(response, 200, {
      user: { id: Number(row.id), name: row.name, username: row.username, role: row.role },
      loggedInAt: session.loggedInAt,
    });
    return;
  }

  if (pathname === "/api/logout" && request.method === "POST") {
    clearSessionCookie(response);
    sendJson(response, 200, { ok: true });
    return;
  }

  const authentication = await authenticatedUser(request);
  if (!authentication) {
    clearSessionCookie(response);
    sendJson(response, 401, { error: "Sesi login tidak valid atau sudah berakhir." });
    return;
  }

  if (pathname === "/api/session" && request.method === "GET") {
    sendJson(response, 200, { user: authentication.user, loggedInAt: authentication.session.loggedInAt });
    return;
  }

  if (pathname === "/api/import-preview" && request.method === "POST") {
    if (authentication.user.role !== "ADMIN") {
      sendJson(response, 403, { error: "Hanya Admin yang dapat mengimpor data." });
      return;
    }
    const buffer = await readRequestBuffer(request);
    sendJson(response, 200, { rows: await previewExcelImport(buffer) });
    return;
  }

  if (pathname === "/api/state" && request.method === "GET") {
    sendJson(response, 200, await readState());
    return;
  }

  if (pathname === "/api/state" && request.method === "PUT") {
    const body = await readRequestBody(request);
    const inputState = JSON.parse(body);
    try {
      const revision = await writeState(inputState, inputState.revision, inputState.operation, authentication.user);
      sendJson(response, 200, { ok: true, revision });
    } catch (error) {
      if (!["STATE_CONFLICT", "STATE_FORBIDDEN", "STATE_OPERATION_REQUIRED"].includes(error.code)) throw error;
      if (error.code !== "STATE_CONFLICT") {
        sendJson(response, 403, { error: error.message });
        return;
      }
      sendJson(response, 409, {
        error: error.message,
        state: await readState(),
      });
    }
    return;
  }

  if (pathname === "/api/reset" && request.method === "POST") {
    if (authentication.user.role !== "ADMIN") {
      sendJson(response, 403, { error: "Hanya Admin yang dapat mereset data." });
      return;
    }
    const revision = await writeState(seedState, null);
    sendJson(response, 200, { ok: true, revision });
    return;
  }

  sendJson(response, 404, { error: "API route not found" });
}

async function handleTemplateDownload(request, response) {
  const template = await createImportTemplate();
  if (request.method === "HEAD") sendExcelHead(response, "template-master-barang.xlsx", template);
  else sendExcel(response, "template-master-barang.xlsx", template);
}

function serveStatic(response, pathname) {
  const publicFile = publicFiles.get(pathname);
  if (!publicFile) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const filePath = path.join(ROOT, publicFile);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    response.end(content);
  });
}

let dbReady;
const readyDb = () => (dbReady ||= initDb());

const server = http.createServer(async (request, response) => {
  try {
    await readyDb();
    setSecurityHeaders(response);
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname === "/health" && (request.method === "GET" || request.method === "HEAD")) {
      try {
        await db.execute("SELECT 1");
        if (request.method === "HEAD") response.writeHead(200).end();
        else sendJson(response, 200, { ok: true });
      } catch {
        if (request.method === "HEAD") response.writeHead(503).end();
        else sendJson(response, 503, { ok: false });
      }
      return;
    }
    if (url.pathname === "/template-master-barang.xlsx" && (request.method === "GET" || request.method === "HEAD")) {
      await handleTemplateDownload(request, response);
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url.pathname);
      return;
    }
    serveStatic(response, url.pathname);
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

async function main() {
  const dbReady = readyDb();

  server.listen(PORT, () => {
    dbReady.then(() => {
      const mode = process.env.TURSO_DATABASE_URL ? "Turso/libSQL remote" : LOCAL_DB_URL;
      console.log(`Cek Gudang running at http://localhost:${PORT}`);
      console.log(`Database: ${mode}`);
    }).catch(() => {});
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}; shutting down.`);
    server.close(() => {
      db.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
  await dbReady;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

Object.assign(server, { assertStateRevision, createSessionToken, hashPassword, readSessionToken, validateStateOperation, verifyPassword });
module.exports = server;
