const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const server = require("../server");
const { assertStateRevision, createSessionToken, hashPassword, readSessionToken, verifyPassword } = server;

(() => {
  const passwordHash = hashPassword("secret-password");
  assert.equal(verifyPassword("secret-password", passwordHash), true);
  assert.equal(verifyPassword("wrong-password", passwordHash), false);

  const now = Date.now();
  const token = createSessionToken(7, now);
  assert.equal(readSessionToken(token, now).userId, 7);
  assert.equal(readSessionToken(`${token}x`, now), null);
  assert.equal(readSessionToken(token, now + 6 * 60 * 60 * 1000), null);
  console.log("Security checks passed.");
})();

(() => {
  assertStateRevision(4, 4);
  assert.throws(() => assertStateRevision(3, 4), { code: "STATE_CONFLICT" });
  console.log("Revision checks passed.");
})();

async function remoteSaveCheck(operation) {
  const appSource = fs.readFileSync(require.resolve("../app.js"), "utf8");
  const saveStateSource = appSource.match(/async function saveState\(operation\) \{[\s\S]*?(?=\nasync function hydrateStateFromBackend)/)?.[0];
  assert.ok(saveStateSource, "saveState function must exist");
  let requestBody;
  const context = {
    API_BASE: "/api",
    state: { revision: 1 },
    stateGeneration: 0,
    saveQueue: Promise.resolve(true),
    structuredClone,
    fetch: async (_url, options) => {
      requestBody = JSON.parse(options.body);
      return { status: 200, ok: true, json: async () => ({ revision: 2 }) };
    },
  };
  vm.runInNewContext(`${saveStateSource}; this.saveState = saveState;`, context);
  assert.equal(await context.saveState(operation), true);
  assert.equal(requestBody.operation, operation);
}

Promise.all([remoteSaveCheck("inbound"), remoteSaveCheck("outbound")])
  .then(() => console.log("Remote transaction save checks passed."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

(() => {
  const appSource = fs.readFileSync(require.resolve("../app.js"), "utf8");
  const start = appSource.indexOf("function groupTransactionItemsByLocation");
  assert.notEqual(start, -1, "groupTransactionItemsByLocation must exist");
  const end = appSource.indexOf("\nfunction ", start + 1);
  const context = {
    productById: (id) => ({ id, locationId: id }),
  };
  vm.runInNewContext(`${appSource.slice(start, end)}; this.group = groupTransactionItemsByLocation;`, context);
  assert.deepEqual(
    Array.from(context.group([
      { productId: 1, locationId: 1, quantity: 2 },
      { productId: 2, locationId: 2, quantity: 3 },
      { productId: 3, locationId: 1, quantity: 4 },
    ]), ([locationId, items]) => [locationId, items.length]),
    [[1, 2], [2, 1]],
  );

  const paginateStart = appSource.indexOf("function paginateRows");
  assert.notEqual(paginateStart, -1, "paginateRows must exist");
  const paginateEnd = appSource.indexOf("\nfunction ", paginateStart + 1);
  vm.runInNewContext(`${appSource.slice(paginateStart, paginateEnd)}; this.paginate = paginateRows;`, context);
  const page = context.paginate(Array.from({ length: 25 }, (_, index) => index + 1), 2, 9);
  assert.deepEqual({ page: page.page, pageCount: page.pageCount, rows: Array.from(page.rows) }, {
    page: 2,
    pageCount: 3,
    rows: Array.from({ length: 9 }, (_, index) => index + 10),
  });
  assert.equal(context.paginate([1, 2, 3], 99, 9).page, 1);
  assert.match(appSource, /paginateRows\(rows, historyPage, 9\)/);
  assert.match(appSource, /data-history-page=/);
  assert.match(appSource, /renderGroups\(hiddenGroups, groups\.length > 1\)/);

  assert.equal(typeof server.validateStateOperation, "function");
  const current = {
    locations: [
      { id: 1, type: "STORAGE" },
      { id: 2, type: "STORAGE" },
      { id: 3, type: "DESTINATION" },
    ],
    products: [
      { id: 1, locationId: 1 },
      { id: 2, locationId: 2 },
    ],
    productStocks: [
      { productId: 1, locationId: 1, quantity: 10 },
      { productId: 2, locationId: 2, quantity: 10 },
    ],
    transactions: [],
    transactionItems: [],
    purchaseRecords: [],
    purchaseItems: [],
  };
  const next = structuredClone(current);
  next.transactions.push({ id: "TRX-1", type: "OUTBOUND", userId: 7, sourceLocationId: null, destLocationId: 3 });
  next.transactionItems.push(
    { id: 1, transactionId: "TRX-1", productId: 1, locationId: 1, quantity: 2 },
    { id: 2, transactionId: "TRX-1", productId: 2, locationId: 2, quantity: 3 },
  );
  next.productStocks[0].quantity = 8;
  next.productStocks[1].quantity = 7;
  assert.doesNotThrow(() => server.validateStateOperation(current, next, "outbound", { id: 7, role: "STAFF" }));

  const negativeStock = structuredClone(next);
  negativeStock.transactionItems[0].quantity = 11;
  negativeStock.productStocks[0].quantity = -1;
  assert.throws(
    () => server.validateStateOperation(current, negativeStock, "outbound", { id: 7, role: "STAFF" }),
    /Stok lokasi tidak cukup/,
  );
  console.log("Multi-location transaction checks passed.");
})();

async function login(baseUrl, username, password) {
  const response = await fetch(`${baseUrl}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return { response, cookie: String(response.headers.get("set-cookie") || "").split(";")[0] };
}

async function integrationChecks() {
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  for (const pathname of ["/server.js", "/package.json", "/Dockerfile", "/.env.example", "/data/cekgudang.db"]) {
      assert.equal((await fetch(`${baseUrl}${pathname}`)).status, 404, `${pathname} must not be public`);
  }
  assert.equal((await fetch(`${baseUrl}/api/state`)).status, 401);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal((await login(baseUrl, "rate-limit-user", "wrong-password")).response.status, 401);
  }
  assert.equal((await login(baseUrl, "rate-limit-user", "wrong-password")).response.status, 429);

  const staffLogin = await login(baseUrl, "lusi", process.env.TEST_STAFF_PASSWORD || "lusi1357");
  assert.equal(staffLogin.response.status, 200);
  const staffStateResponse = await fetch(`${baseUrl}/api/state`, { headers: { Cookie: staffLogin.cookie } });
  const staffState = await staffStateResponse.json();
  staffState.operation = "purchase";
  assert.equal((await fetch(`${baseUrl}/api/state`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: staffLogin.cookie },
    body: JSON.stringify(staffState),
  })).status, 403);

  const adminLogin = await login(baseUrl, "erando23", process.env.TEST_ADMIN_PASSWORD || "erando23");
  assert.equal(adminLogin.response.status, 200);
  const templateResponse = await fetch(`${baseUrl}/template-master-barang.xlsx`);
  assert.equal(templateResponse.status, 200);
  assert.match(String(templateResponse.headers.get("content-type")), /spreadsheetml/);
  const previewResponse = await fetch(`${baseUrl}/api/import-preview`, {
    method: "POST",
    headers: { Cookie: adminLogin.cookie },
    body: await templateResponse.arrayBuffer(),
  });
  assert.equal(previewResponse.status, 200);
  assert.equal((await previewResponse.json()).rows.length, 2);
  const adminState = await (await fetch(`${baseUrl}/api/state`, { headers: { Cookie: adminLogin.cookie } })).json();
  assert.equal(adminState.users.some((user) => Object.hasOwn(user, "password")), false);
  console.log("HTTP integration checks passed.");
}

if (process.argv.includes("--integration")) {
  integrationChecks().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
} else {
  console.log("HTTP integration checks skipped; run `npm run test:integration` with the server running.");
}
