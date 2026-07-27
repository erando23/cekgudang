const STORAGE_KEY = "cekgudang_state_v1";
const SESSION_KEY = "cekgudang_session_v1";
const SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const THEME_KEY = "cekgudang_theme_v1";
const API_BASE = window.location.protocol.startsWith("http") ? "/api" : "";

const ROLE_LABELS = {
  ADMIN: "Admin",
  STAFF: "Staff",
  AKUNTAN: "Akuntan",
};

const ROUTE_ACCESS = {
  dashboard: ["ADMIN", "STAFF", "AKUNTAN"],
  inbound: ["ADMIN", "STAFF", "AKUNTAN"],
  outbound: ["ADMIN", "STAFF", "AKUNTAN"],
  purchase: ["ADMIN", "AKUNTAN"],
  history: ["ADMIN", "STAFF", "AKUNTAN"],
  master: ["ADMIN", "STAFF", "AKUNTAN"],
};

const icons = {
  dashboard:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='3' width='7' height='8' rx='2'></rect><rect x='14' y='3' width='7' height='5' rx='2'></rect><rect x='14' y='12' width='7' height='9' rx='2'></rect><rect x='3' y='15' width='7' height='6' rx='2'></rect></svg>",
  inbound:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M12 5v14'></path><path d='M5 12h14'></path><path d='M4 19h16'></path></svg>",
  outbound:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M5 12h14'></path><path d='m13 6 6 6-6 6'></path><path d='M4 19h16'></path></svg>",
  history:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M3 12a9 9 0 1 0 3-6.7'></path><path d='M3 4v5h5'></path><path d='M12 7v5l3 2'></path></svg>",
  purchase:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M6 2v20'></path><path d='M18 6a4 4 0 0 0-4-4h-3a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-3a4 4 0 0 1-4-4'></path></svg>",
  master:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M4 7h16'></path><path d='M4 12h16'></path><path d='M4 17h16'></path><circle cx='8' cy='7' r='1'></circle><circle cx='8' cy='12' r='1'></circle><circle cx='8' cy='17' r='1'></circle></svg>",
  warehouse:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M3 21h18'></path><path d='M4 21V9l8-5 8 5v12'></path><path d='M9 21v-7h6v7'></path><path d='M8 11h.01'></path><path d='M16 11h.01'></path></svg>",
  search:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='11' cy='11' r='7'></circle><path d='m20 20-3.5-3.5'></path></svg>",
  plus:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M12 5v14'></path><path d='M5 12h14'></path></svg>",
  moon:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M21 13a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10Z'></path></svg>",
  sun:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='12' r='4'></circle><path d='M12 2v2'></path><path d='M12 20v2'></path><path d='m4.93 4.93 1.41 1.41'></path><path d='m17.66 17.66 1.41 1.41'></path><path d='M2 12h2'></path><path d='M20 12h2'></path><path d='m6.34 17.66-1.41 1.41'></path><path d='m19.07 4.93-1.41 1.41'></path></svg>",
  eye:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z'></path><circle cx='12' cy='12' r='3'></circle></svg>",
  edit:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M12 20h9'></path><path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'></path></svg>",
  trash:
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M3 6h18'></path><path d='M8 6V4h8v2'></path><path d='m19 6-1 14H6L5 6'></path></svg>",
};

const seedState = {
  revision: 0,
  users: [
    {
      id: 1,
      name: "Erando23",
      username: "erando23",
      role: "ADMIN",
    },
    {
      id: 2,
      name: "Vivi",
      username: "vivi",
      role: "AKUNTAN",
    },
    {
      id: 3,
      name: "Lusi",
      username: "lusi",
      role: "STAFF",
    },
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
    {
      id: 1,
      name: "Telur",
      unit: "tray",
      minStock: 10,
      locationId: 1,
      active: true,
    },
    {
      id: 2,
      name: "Minyak Goreng",
      unit: "pcs",
      minStock: 8,
      locationId: 1,
      active: true,
    },
    {
      id: 3,
      name: "Tepung Terigu",
      unit: "kg",
      minStock: 15,
      locationId: 1,
      active: true,
    },
    {
      id: 4,
      name: "Daging Slice",
      unit: "pack",
      minStock: 12,
      locationId: 2,
      active: true,
    },
    {
      id: 5,
      name: "Ayam Fillet",
      unit: "kg",
      minStock: 10,
      locationId: 2,
      active: true,
    },
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

const appUsers = structuredClone(seedState.users);

let state = loadState();
let session = loadSession();
let sessionExpiryTimer = null;
let saveQueue = Promise.resolve(true);
let stateGeneration = 0;
let route = "dashboard";
let inboundCart = [];
let outboundCart = [];
let purchaseCart = [];
let purchaseFilterDate = todayInputValue();
let purchaseFilterMonth = todayInputValue().slice(0, 7);
let purchaseMode = "input";
let purchaseDashboardPeriod = "day";
let purchaseRecordOutletFilter = "all";
let purchaseRecordPeriod = "day";
let purchaseRecordSearch = "";
let purchaseSearchDebounce = null;
let historyTab = "transaction";
let historyPage = 1;
let masterLowOnly = false;
let masterSearchQuery = "";
let masterModalOpen = false;
let masterEditingProductId = null;
let productDetailId = null;
let csvImportPreview = null;
let itemHistoryProductId = "";
let theme = localStorage.getItem(THEME_KEY) || "light";
let isHydrating = Boolean(API_BASE);

const app = document.getElementById("app");

function loadState() {
  if (API_BASE) return structuredClone(seedState);
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedState));
    return structuredClone(seedState);
  }
  return migrateState(JSON.parse(saved));
}

function migrateState(savedState) {
  savedState.revision = Number(savedState.revision || 0);
  savedState.users = appUsers.map((user) => ({ ...user }));
  savedState.locations ||= structuredClone(seedState.locations);
  savedState.products ||= [];
  savedState.productStocks ||= [];
  savedState.transactions ||= [];
  savedState.transactionItems ||= [];
  savedState.purchaseRecords ||= [];
  savedState.purchaseItems ||= [];

  savedState.products = savedState.products.map((product) => {
    if (product.locationId) return product;
    const stockRows = savedState.productStocks.filter(
      (stock) => stock.productId === product.id && Number(stock.quantity) > 0,
    );
    const fallbackStock = savedState.productStocks.find(
      (stock) => stock.productId === product.id,
    );
    return {
      ...product,
      locationId: stockRows[0]?.locationId || fallbackStock?.locationId || 1,
    };
  });

  savedState.productStocks = savedState.products.flatMap((product) => {
    const quantity = savedState.productStocks
      .filter((stock) => stock.productId === product.id)
      .reduce((sum, stock) => sum + Number(stock.quantity), 0);
    return [
      { productId: product.id, locationId: product.locationId, quantity },
    ];
  });
  savedState.transactionItems = savedState.transactionItems.map((item) => ({
    ...item,
    locationId: Number(item.locationId || savedState.products.find((product) => product.id === Number(item.productId))?.locationId || 0),
  }));
  savedState.purchaseItems = savedState.purchaseItems.map((item) => {
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
  if (!API_BASE) localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
  return savedState;
}

async function saveState(operation) {
  if (API_BASE) {
    const snapshot = structuredClone(state);
    snapshot.operation = operation;
    const generation = stateGeneration;
    const pendingSave = saveQueue
      .then(async () => {
        if (generation !== stateGeneration) return false;
        snapshot.revision = state.revision;
        const response = await fetch(`${API_BASE}/state`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot),
        });
        const payload = await response.json().catch(() => ({}));
        if (response.status === 401) {
          stateGeneration += 1;
          saveSession(null);
          route = "dashboard";
          render();
          toast("Sesi login sudah berakhir.");
          return false;
        }
        if (response.status === 409 && payload.state) {
          stateGeneration += 1;
          state = migrateState(payload.state);
          render();
          toast("Data berubah oleh pengguna lain. Perubahan Anda tidak disimpan; data terbaru sudah dimuat.");
          return false;
        }
        if (response.status === 403) {
          toast(payload.error || "Operasi tidak diizinkan.");
          return false;
        }
        if (!response.ok) throw new Error("Backend state update failed");
        state.revision = Number(payload.revision);
        return true;
      })
      .catch(() => {
        toast("Gagal menyimpan ke backend.");
        return false;
      });
    saveQueue = pendingSave;
    return pendingSave;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return true;
}

async function hydrateStateFromBackend() {
  if (!API_BASE) return;
  const hadSession = Boolean(session);
  try {
    const sessionResponse = await fetch(`${API_BASE}/session`);
    if (!sessionResponse.ok) throw new Error("Session request failed");
    const sessionPayload = await sessionResponse.json();
    saveSession({ userId: sessionPayload.user.id, loggedInAt: sessionPayload.loggedInAt });
    const response = await fetch(`${API_BASE}/state`);
    if (!response.ok) throw new Error("Backend state request failed");
    state = migrateState(await response.json());
    isHydrating = false;
    render();
  } catch (error) {
    saveSession(null);
    isHydrating = false;
    if (error.message === "Session request failed") {
      if (hadSession) toast("Sesi login tidak valid atau sudah berakhir.");
    } else toast("Backend tidak dapat dimuat. Silakan login ulang.");
    render();
  }
}

function loadSession() {
  const saved = localStorage.getItem(SESSION_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    const loggedInAt = Date.parse(parsed.loggedInAt);
    if (!parsed.userId || !Number.isFinite(loggedInAt) || Date.now() - loggedInAt >= SESSION_MAX_AGE_MS) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function scheduleSessionExpiry() {
  clearTimeout(sessionExpiryTimer);
  if (!session) return;
  const loggedInAt = Date.parse(session.loggedInAt);
  const remaining = SESSION_MAX_AGE_MS - (Date.now() - loggedInAt);
  sessionExpiryTimer = setTimeout(() => {
    if (!session) return;
    saveSession(null);
    route = "dashboard";
    render();
    toast("Sesi login berakhir setelah 6 jam.");
  }, Math.max(remaining, 0));
}

function saveSession(nextSession) {
  session = nextSession;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  scheduleSessionExpiry();
}

scheduleSessionExpiry();

function currentUser() {
  return session
    ? state.users.find((user) => user.id === session.userId)
    : null;
}

function isAdmin() {
  const user = currentUser();
  return user && user.role === "ADMIN";
}

function userRole() {
  return currentUser()?.role || "";
}

function roleLabel(role = userRole()) {
  return ROLE_LABELS[role] || "Staff";
}

function canAccessRoute(routeKey) {
  const allowedRoles = ROUTE_ACCESS[routeKey] || ROUTE_ACCESS.dashboard;
  return allowedRoles.includes(userRole());
}

function canUseBulkImport() {
  return userRole() === "ADMIN";
}

function canViewPurchaseDashboard() {
  return userRole() === "ADMIN";
}

function todayInputValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function storageLocations() {
  return state.locations.filter((location) => location.type === "STORAGE");
}

function destinationLocations() {
  return state.locations.filter((location) => location.type === "DESTINATION");
}

function productById(id) {
  return state.products.find((product) => product.id === Number(id));
}

function groupTransactionItemsByLocation(items) {
  return items.reduce((groups, item) => {
    const locationId = Number(item.locationId || item.sourceId || productById(item.productId)?.locationId || 0);
    if (!groups.has(locationId)) groups.set(locationId, []);
    groups.get(locationId).push(item);
    return groups;
  }, new Map());
}

function paginateRows(rows, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), pageCount);
  const start = (currentPage - 1) * pageSize;
  return { page: currentPage, pageCount, rows: rows.slice(start, start + pageSize) };
}

function locationById(id) {
  return state.locations.find((location) => location.id === Number(id));
}

function stockFor(productId, locationId) {
  const row = state.productStocks.find(
    (stock) =>
      stock.productId === Number(productId) &&
      stock.locationId === Number(locationId),
  );
  return row ? Number(row.quantity) : 0;
}

function totalStock(productId) {
  return state.productStocks
    .filter((stock) => stock.productId === Number(productId))
    .reduce((sum, stock) => sum + Number(stock.quantity), 0);
}

function setStock(productId, locationId, quantity) {
  const row = state.productStocks.find(
    (stock) =>
      stock.productId === Number(productId) &&
      stock.locationId === Number(locationId),
  );
  if (row) {
    row.quantity = quantity;
    return;
  }
  state.productStocks.push({
    productId: Number(productId),
    locationId: Number(locationId),
    quantity,
  });
}

function productLocation(productId) {
  const product = productById(productId);
  return product ? locationById(product.locationId) : null;
}

function activeProducts() {
  return state.products.filter((product) => product.active !== false);
}

function purchaseRecordById(id) {
  return state.purchaseRecords.find((record) => record.id === id);
}

function purchaseItemsFor(recordId) {
  return state.purchaseItems.filter((item) => item.purchaseId === recordId);
}

function purchaseTotal(recordId) {
  return purchaseItemsFor(recordId).reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
}

function visiblePurchaseRecords() {
  const user = currentUser();
  if (!user) return [];
  return user.role === "ADMIN"
    ? state.purchaseRecords
    : state.purchaseRecords.filter((record) => record.userId === user.id);
}

function purchaseRecordDateOptions() {
  const dates = Array.from(new Set(visiblePurchaseRecords().map((record) => record.date).filter(Boolean)));
  if (!dates.includes(purchaseFilterDate)) dates.push(purchaseFilterDate);
  return dates.sort((a, b) => b.localeCompare(a));
}

function purchaseMonthOptions() {
  const months = Array.from(new Set(visiblePurchaseRecords().map((record) => record.date?.slice(0, 7)).filter(Boolean)));
  if (!months.includes(purchaseFilterMonth)) months.push(purchaseFilterMonth);
  return months.sort((a, b) => b.localeCompare(a));
}

function purchaseRecordsForDate(date) {
  return visiblePurchaseRecords().filter((record) => record.date === date);
}

function purchaseRecordsForMonth(month) {
  return visiblePurchaseRecords().filter((record) => record.date && record.date.slice(0, 7) === month);
}

function purchaseRecordsForSelectedPeriod(period = purchaseDashboardPeriod) {
  return period === "month"
    ? purchaseRecordsForMonth(purchaseFilterMonth)
    : purchaseRecordsForDate(purchaseFilterDate);
}

function purchaseFilteredRecordList() {
  const baseRecords = purchaseRecordPeriod === "month"
    ? purchaseRecordsForMonth(purchaseFilterMonth)
    : purchaseRecordsForDate(purchaseFilterDate);
  const query = purchaseRecordSearch.trim().toLowerCase();
  return baseRecords
    .filter((record) => purchaseRecordOutletFilter === "all" || Number(record.outletLocationId) === Number(purchaseRecordOutletFilter))
    .filter((record) => {
      if (!query) return true;
      const outlet = locationById(record.outletLocationId);
      const user = state.users.find((item) => item.id === record.userId);
      const items = purchaseItemsFor(record.id).map((item) => {
        const product = item.productId ? productById(item.productId) : null;
        return product ? product.name : item.freeName || "Item bebas";
      });
      return [record.id, record.note, outlet?.name, user?.name, ...items]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    })
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
}

function purchaseRecordsTotal(records) {
  return records.reduce((sum, record) => sum + purchaseTotal(record.id), 0);
}

function purchaseItemsCount(records) {
  const recordIds = new Set(records.map((record) => record.id));
  return state.purchaseItems.filter((item) => recordIds.has(item.purchaseId)).length;
}

function purchaseOutletBreakdown(records) {
  const totals = new Map(
    destinationLocations().map((location) => [
      location.id,
      { location, total: 0, records: 0, items: 0 },
    ]),
  );
  records.forEach((record) => {
    const row = totals.get(Number(record.outletLocationId));
    if (!row) return;
    const items = purchaseItemsFor(record.id);
    row.total += purchaseTotal(record.id);
    row.records += 1;
    row.items += items.length;
  });
  return Array.from(totals.values()).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

function purchaseDailyTrend(month) {
  const days = new Map();
  purchaseRecordsForMonth(month).forEach((record) => {
    days.set(record.date, (days.get(record.date) || 0) + purchaseTotal(record.id));
  });
  return Array.from(days, ([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));
}

function parseCurrencyInput(value) {
  const normalized = String(value || "").replace(/[^0-9-]/g, "");
  return normalized ? Number(normalized) : 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function lastPurchaseInfo(productId) {
  return state.purchaseItems
    .filter((item) => Number(item.productId) === Number(productId) && Number(item.unitPrice) > 0)
    .map((item) => ({ item, record: purchaseRecordById(item.purchaseId) }))
    .filter((row) => row.record && row.record.type === "PURCHASE")
    .sort((a, b) => {
      const aTime = new Date(a.record.createdAt || a.record.date).getTime();
      const bTime = new Date(b.record.createdAt || b.record.date).getTime();
      return bTime - aTime || Number(b.item.id) - Number(a.item.id);
    })[0] || null;
}

function nextId(collection) {
  return collection.length
    ? Math.max(...collection.map((item) => Number(item.id) || 0)) + 1
    : 1;
}

function trxId() {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replaceAll("-", "");
  const count =
    state.transactions.filter((trx) => trx.id.includes(ymd)).length + 1;
  return `TRX-${ymd}-${String(count).padStart(3, "0")}`;
}

function purchaseId() {
  const ymd = todayInputValue().replaceAll("-", "");
  const count = state.purchaseRecords.filter((record) => record.id.includes(ymd)).length + 1;
  return `BLJ-${ymd}-${String(count).padStart(3, "0")}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function optionHtml(items, selectedId = "") {
  return items
    .map(
      (item) =>
        `<option value="${item.id}" ${Number(selectedId) === item.id ? "selected" : ""}>${item.name}</option>`,
    )
    .join("");
}

function productsForLocation(locationId) {
  return activeProducts().filter(
    (product) => product.locationId === Number(locationId),
  );
}

function productSearchLabel(product) {
  return `${product.name} (${product.unit})`;
}

function productOptionsForLocation(locationId = "") {
  return locationId ? productsForLocation(locationId) : activeProducts();
}

function productOptionHtml(locationId = "") {
  const products = productOptionsForLocation(locationId);
  if (!products.length) return `<option value="Tidak ada barang di lokasi ini"></option>`;
  return products
    .map((product) => `<option value="${escapeAttribute(productSearchLabel(product))}"></option>`)
    .join("");
}

function productPickerHtml({ id, locationId }) {
  const products = productOptionsForLocation(locationId);
  return `
    <input name="productSearch" list="${id}" placeholder="Ketik nama barang" autocomplete="off" value="" ${products.length ? "" : "disabled"} required />
    <input name="productId" type="hidden" value="" />
    <datalist id="${id}">${productOptionHtml(locationId)}</datalist>
  `;
}

function findProductFromSearch(value, locationId = "") {
  const products = locationId
    ? productsForLocation(locationId)
    : activeProducts();
  const normalizedValue = String(value || "").trim().toLowerCase();
  return products.find(
    (product) => productSearchLabel(product).toLowerCase() === normalizedValue,
  );
}

function findProductByName(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return activeProducts().find((product) => product.name.toLowerCase() === normalizedValue);
}

function updatePurchaseUnitLock(formElement) {
  const product = findProductFromSearch(formElement.itemName.value);
  const hint = formElement.querySelector("[data-unit-hint]");
  const priceHint = formElement.querySelector("[data-price-preview]");
  const priceInput = formElement.unitPrice;
  const previousAutoProduct = priceInput.dataset.autofilledProduct || "";
  formElement.productId.value = product ? product.id : "";
  formElement.unit.readOnly = Boolean(product);
  formElement.unit.classList.toggle("locked-input", Boolean(product));
  if (product) {
    formElement.unit.value = product.unit;
    const lastPurchase = lastPurchaseInfo(product.id);
    const shouldAutofillPrice = !parseCurrencyInput(priceInput.value) || (previousAutoProduct && previousAutoProduct !== String(product.id));
    if (lastPurchase && shouldAutofillPrice) {
      priceInput.value = formatNumber(lastPurchase.item.unitPrice);
      priceInput.dataset.autofilledProduct = String(product.id);
    } else if (!lastPurchase && previousAutoProduct) {
      priceInput.value = "";
      delete priceInput.dataset.autofilledProduct;
    }
  }
  if (!product && !formElement.itemName.value.trim()) formElement.unit.value = "";
  if (hint) {
    hint.textContent = product
      ? `Satuan terkunci dari master barang: ${product.unit}.`
      : "Item bebas bisa isi satuan manual.";
  }
  if (priceHint) updatePurchasePriceInput(formElement);
}

function updatePurchasePriceInput(formElement) {
  const input = formElement.unitPrice;
  const preview = formElement.querySelector("[data-price-preview]");
  const price = parseCurrencyInput(input.value);
  input.value = price ? formatNumber(price) : "";
  if (preview) preview.textContent = formatCurrency(price);
}

function purchaseCartHeaderFromForm(formElement) {
  return {
    date: String(formElement.date.value || todayInputValue()),
    outletLocationId: Number(formElement.outletLocationId.value),
    type: String(formElement.type.value || "PURCHASE"),
    note: String(formElement.note.value || "").trim(),
  };
}

function canUsePurchaseCartHeader(header) {
  if (!header.outletLocationId) return toast("Outlet wajib dipilih."), false;
  if (!purchaseCart.length) return true;
  if (
    purchaseCart[0].date !== header.date ||
    purchaseCart[0].outletLocationId !== header.outletLocationId ||
    purchaseCart[0].type !== header.type ||
    purchaseCart[0].note !== header.note
  ) {
    toast("Satu catatan belanja hanya boleh memakai tanggal, outlet, jenis, dan catatan yang sama.");
    return false;
  }
  return true;
}

function purchaseCartItemFromInput(header, { name, quantity, unit, unitPrice }) {
  const product = findProductFromSearch(name) || findProductByName(name);
  const itemName = String(name || "").trim();
  const qty = Number(quantity);
  const price = Number(unitPrice);
  const itemUnit = product ? product.unit : String(unit || "").trim();
  if (!itemName || !itemUnit || !Number.isFinite(qty) || !Number.isFinite(price)) return null;
  if (header.type === "PURCHASE" && (qty <= 0 || price < 0)) return null;
  if (header.type === "ADJUSTMENT" && qty === 0) return null;
  return {
    ...header,
    productId: product ? product.id : null,
    freeName: product ? null : itemName,
    name: product ? product.name : itemName,
    quantity: qty,
    unit: itemUnit,
    unitPrice: price,
    subtotal: qty * price,
  };
}

function parseCsvLine(line, delimiter) {
  // ponytail: one record per line; use a CSV library if multiline quoted fields become necessary.
  const fields = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      fields.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  if (quoted) throw new Error("CSV memiliki tanda kutip yang tidak lengkap.");
  fields.push(value.trim());
  return fields;
}

function normalizeCsvHeader(value) {
  return String(value || "").replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function parsePurchaseCsv(text) {
  const lines = String(text || "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("CSV harus memiliki header dan minimal satu item.");
  const delimiter = lines[0].split(";").length > lines[0].split(",").length ? ";" : ",";
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeCsvHeader);
  const column = (names) => headers.findIndex((header) => names.includes(header));
  const nameIndex = column(["nama", "nama barang", "item", "barang", "name"]);
  const quantityIndex = column(["qty", "jumlah", "quantity", "kuantitas"]);
  const unitIndex = column(["satuan", "unit"]);
  const priceIndex = column(["harga", "harga satuan", "unit price", "unitprice"]);
  if ([nameIndex, quantityIndex, unitIndex, priceIndex].includes(-1)) {
    throw new Error("Header CSV wajib: nama, qty, satuan, harga.");
  }
  return lines.slice(1).map((line) => {
    const fields = parseCsvLine(line, delimiter);
    return {
      name: fields[nameIndex],
      quantity: Number(String(fields[quantityIndex] || "").replace(",", ".")),
      unit: fields[unitIndex],
      unitPrice: parseCurrencyInput(fields[priceIndex]),
    };
  });
}

function purchaseCsvParserSelfCheck() {
  const rows = parsePurchaseCsv('nama barang;qty;satuan;harga satuan\n"Susu UHT";2;liter;20.000\nNori;3;pack;105000');
  console.assert(
    rows.length === 2 && rows[0].name === "Susu UHT" && rows[0].unitPrice === 20000 && rows[1].quantity === 3,
    "Parser CSV belanja gagal mengenali format dasar.",
  );
}

purchaseCsvParserSelfCheck();

async function importPurchaseCsv(event, formElement) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".csv")) return toast("Gunakan file CSV.");
  if (file.size > 2 * 1024 * 1024) return toast("Ukuran CSV maksimal 2 MB.");
  const header = purchaseCartHeaderFromForm(formElement);
  if (!canUsePurchaseCartHeader(header)) return;
  try {
    const rows = parsePurchaseCsv(await file.text());
    const items = rows.map((row) => purchaseCartItemFromInput(header, row)).filter(Boolean);
    if (!items.length) return toast("Tidak ada item CSV yang valid.");
    purchaseCart.push(...items);
    toast(`${items.length} item masuk ke daftar sementara${items.length < rows.length ? `, ${rows.length - items.length} dilewati` : ""}.`);
    render();
  } catch (error) {
    toast(error.message || "CSV tidak bisa dibaca.");
  }
}

function toast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function escapeAttribute(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function setRoute(nextRoute) {
  const normalizedRoute = nextRoute === "warehouse" ? "dashboard" : nextRoute;
  route = canAccessRoute(normalizedRoute) ? normalizedRoute : "dashboard";
  productDetailId = null;
  render();
}

function navItems() {
  return [
    { key: "dashboard", label: "Dashboard" },
    { key: "inbound", label: "Masuk" },
    { key: "outbound", label: "Keluar" },
    { key: "purchase", label: "Belanja" },
    { key: "history", label: "Riwayat" },
    { key: "master", label: "Master" },
  ].filter((item) => canAccessRoute(item.key));
}

function setTheme(nextTheme) {
  theme = nextTheme;
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
}

function pageMeta() {
  const meta = {
    dashboard: ["Dashboard", "Ringkasan stok, transaksi, dan prioritas restock."],
    inbound: ["Barang Masuk", "Catat restock gudang dengan cepat dan rapi."],
    outbound: ["Barang Keluar", "Distribusi stok ke dapur dan cabang."],
    purchase: ["Belanja", "Catat pengeluaran harian per outlet dan harga beli terakhir."],
    history: ["Riwayat", "Audit transaksi dan pergerakan barang."],
    master: ["Inventory", "Master barang, stok, dan pengaturan minimum."],
  };
  return meta[route] || meta.dashboard;
}

function renderTopbar(user) {
  const [title, subtitle] = pageMeta();
  return `
    <header class="topbar">
      <div class="topbar-title">
        <span class="eyebrow">Cek Gudang</span>
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      <div class="topbar-actions">
        <label class="global-search">
          <span>${icons.search}</span>
          <input aria-label="Cari" placeholder="Cari barang, lokasi, transaksi..." value="${route === "master" ? escapeAttribute(masterSearchQuery) : ""}" />
        </label>
        <button class="icon-btn" data-action="toggle-theme" title="Toggle dark mode" aria-label="Toggle dark mode">${theme === "dark" ? icons.sun : icons.moon}</button>
        <div class="avatar-chip"><span>${user.name.slice(0, 1)}</span><div><strong>${user.name}</strong><small>${roleLabel(user.role)}</small></div></div>
      </div>
    </header>
  `;
}

function render() {
  document.documentElement.dataset.theme = theme;
  if (!currentUser()) {
    renderLogin();
    return;
  }

  const user = currentUser();
  if (!canAccessRoute(route)) route = "dashboard";
  app.innerHTML = `
    <div class="mobile-bar">
      <strong>Cek Gudang</strong>
      <button class="icon-btn" data-action="toggle-theme" title="Toggle dark mode" aria-label="Toggle dark mode">${theme === "dark" ? icons.sun : icons.moon}</button>
    </div>
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">CG</div>
          <div>
            <div class="brand-title">Cek Gudang</div>
            <div class="brand-subtitle">Inventaris Cafe</div>
          </div>
        </div>
        <nav class="nav">
          ${navItems()
            .map(
              (item) => `
                <button class="${route === item.key ? "active" : ""}" data-route="${item.key}">
                  <span class="nav-icon">${icons[item.key]}</span>
                  <span>${item.label}</span>
                </button>
              `,
            )
            .join("")}
        </nav>
        <div class="sidebar-footer">
          <div class="user-chip">
            <strong>${user.name}</strong>
            <span>${roleLabel(user.role)}</span>
          </div>
          <button class="btn secondary" data-action="logout">Logout</button>
        </div>
      </aside>
      <main class="content">${renderTopbar(user)}${isHydrating ? renderSkeletonPage() : renderPage()}</main>
    </div>
  `;

  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.route));
  });
  document
    .querySelector('[data-action="logout"]')
    .addEventListener("click", async () => {
      if (API_BASE) await fetch(`${API_BASE}/logout`, { method: "POST" }).catch(() => {});
      saveSession(null);
      route = "dashboard";
      render();
    });
  document.querySelectorAll('[data-action="toggle-theme"]').forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(theme === "dark" ? "light" : "dark");
      render();
    });
  });
  const globalSearch = document.querySelector(".global-search input");
  if (globalSearch) {
    globalSearch.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      masterSearchQuery = event.currentTarget.value.trim();
      route = "master";
      render();
    });
  }
  bindPageEvents();
}

function renderLogin() {
  app.innerHTML = `
    <main class="login-page">
      <div class="login-orbit" aria-hidden="true"></div>
      <section class="login-panel">
        <div class="brand" style="color: var(--text); margin-bottom: 18px;">
          <div class="brand-mark">CG</div>
          <div>
            <div class="brand-title">Cek Gudang Cafe</div>
            <div class="brand-subtitle" style="color: var(--muted);">Login operasional stok</div>
          </div>
        </div>
        <h1>Masuk ke sistem</h1>
        <p>Gunakan akun admin atau staff untuk mulai mencatat stok gudang.</p>
        <div class="login-signal" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <form id="login-form" class="grid" style="margin-top: 18px;">
          <div class="field">
            <label>Username</label>
            <input name="username" autocomplete="username" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input name="password" type="password" autocomplete="current-password" required />
          </div>
          <button class="btn" type="submit">Login</button>
        </form>
      </section>
    </main>
  `;

  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    login(form.get("username"), form.get("password"));
  });
}

async function login(username, password) {
  if (!API_BASE) {
    toast("Login membutuhkan server backend.");
    return;
  }
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Login gagal.");
    saveSession({ userId: payload.user.id, loggedInAt: payload.loggedInAt });
    isHydrating = true;
    render();
    await hydrateStateFromBackend();
  } catch (error) {
    toast(error.message || "Login gagal.");
  }
}

function renderPage() {
  if (!canAccessRoute(route)) return renderAccessDenied();
  if (route === "inbound") return renderInbound();
  if (route === "outbound") return renderOutbound();
  if (route === "purchase") return renderPurchase();
  if (route === "history") return renderHistory();
  if (route === "master") return renderMaster();
  return renderDashboard();
}

function renderAccessDenied() {
  return `
    <section class="panel">
      <h2 class="section-title">Akses dibatasi</h2>
      <p class="muted">Role ${roleLabel()} tidak memiliki akses ke halaman ini.</p>
    </section>
  `;
}

function renderSkeletonPage() {
  return `
    <section class="grid cols-4 skeleton-grid">
      <div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>
    </section>
    <section class="panel skeleton-panel"><div></div><div></div><div></div><div></div></section>
  `;
}

function emptyState(title, text, action = "") {
  return `<div class="empty-state"><div class="empty-icon">${icons.warehouse}</div><strong>${title}</strong><p>${text}</p>${action}</div>`;
}

function locationStockTotal(locationId) {
  return activeProducts()
    .filter((product) => product.locationId === Number(locationId))
    .reduce((sum, product) => sum + stockFor(product.id, locationId), 0);
}

function lowProductsForLocation(locationId) {
  return activeProducts().filter(
    (product) => product.locationId === Number(locationId) && stockFor(product.id, locationId) <= Number(product.minStock),
  );
}

function renderDashboard() {
  const products = activeProducts();
  const lowStock = products.filter(
    (product) => totalStock(product.id) <= Number(product.minStock),
  );
  const inboundCount = state.transactions.filter(
    (trx) => trx.type === "INBOUND",
  ).length;
  const outboundCount = state.transactions.filter(
    (trx) => trx.type === "OUTBOUND",
  ).length;
  const stockUnits = state.productStocks.reduce((sum, stock) => sum + Number(stock.quantity), 0);
  const warehouseCount = storageLocations().length;
  return `
    <section class="dashboard-hero motion-fade">
      <div>
        <span class="eyebrow">Inventory command center</span>
        <h2>Operasional stok cafe yang tenang, cepat, dan akurat.</h2>
        <p>Ringkasan kondisi stok terbaru di semua lokasi penyimpanan dengan kontrol transaksi cepat.</p>
        <div class="actions hero-actions">
          <button class="btn" data-action="share-stock">Share Stok WA</button>
          <button class="btn ghost" data-route="master">Lihat Inventory</button>
        </div>
      </div>
      <div class="dashboard-illustration" aria-hidden="true">
        <div class="orbital-card card-a"><span>Freezer A</span><strong>${stockFor(4, 2) + stockFor(5, 2)}</strong></div>
        <div class="orbital-card card-b"><span>Low Stock</span><strong>${lowStock.length}</strong></div>
        <div class="mock-window">
          <div class="mock-dots"><i></i><i></i><i></i></div>
          <div class="mock-line long"></div>
          <div class="mock-line"></div>
          <div class="mock-bars"><i></i><i></i><i></i></div>
        </div>
      </div>
    </section>
    <section class="grid cols-4 analytics-grid">
      <div class="stat"><span>Total SKU</span><strong>${products.length}</strong><small>Barang aktif</small></div>
      <div class="stat"><span>Total Unit</span><strong>${stockUnits}</strong><small>Di seluruh gudang</small></div>
      <div class="stat accent"><span>Low Stock</span><strong>${lowStock.length}</strong><small>Butuh perhatian</small></div>
      <div class="stat"><span>Gudang</span><strong>${warehouseCount}</strong><small>Lokasi penyimpanan</small></div>
    </section>
    <section class="grid cols-2" style="margin-top: 14px;">
      <div class="panel">
        <h2 class="section-title">Perlu Restock</h2>
        <div class="low-list">
          ${lowStock.length ? lowStock.map(renderLowStockRow).join("") : emptyState("Stok aman", "Tidak ada barang low stock saat ini.")}
        </div>
      </div>
      <div class="panel">
        <h2 class="section-title">Transaksi Terbaru</h2>
        <div class="transaction-list">
          ${state.transactions.slice(-5).reverse().map(renderTransactionCard).join("") || emptyState("Belum ada transaksi", "Transaksi masuk dan keluar akan muncul di sini.")}
        </div>
      </div>
    </section>
  `;
}

function renderLowStockRow(product) {
  return `
    <div class="low-row">
      <div>
        <strong>${product.name}</strong>
        <div class="muted">Total ${totalStock(product.id)} ${product.unit}, minimum ${product.minStock} ${product.unit}</div>
      </div>
      <span class="badge danger">Low stock</span>
    </div>
  `;
}

function renderInbound() {
  return `
    <div class="page-head motion-fade">
      <div>
        <h1>Barang Masuk</h1>
        <p>Catat restock beberapa barang dalam satu ID transaksi.</p>
      </div>
    </div>
    <section class="grid cols-2">
      <div class="panel">
        <h2 class="section-title">Tambah ke Daftar</h2>
        <form id="inbound-add" class="grid">
          <div class="form-grid">
            <div class="field">
              <label>Barang</label>
              ${productPickerHtml({ id: "inbound-product-options" })}
            </div>
            <div class="field">
              <label>Jumlah</label>
              <input name="quantity" type="number" min="1" value="1" required />
            </div>
          </div>
          <small class="muted">Lokasi penyimpanan otomatis mengikuti master barang.</small>
          <button class="btn" type="submit">Tambah ke Daftar</button>
        </form>
      </div>
      <div class="panel">
        <h2 class="section-title">Daftar Barang Masuk</h2>
        ${renderCart(inboundCart, "inbound")}
        <div class="actions" style="margin-top: 12px;">
          <button class="btn" data-action="submit-inbound">Submit Barang Masuk</button>
          <button class="btn ghost" data-action="clear-inbound">Kosongkan</button>
        </div>
      </div>
    </section>
  `;
}

function renderOutbound() {
  const defaultSourceId = storageLocations()[0]?.id || "";
  const destinationId = outboundCart[0]?.destId || destinationLocations()[0]?.id || "";
  return `
    <div class="page-head motion-fade">
      <div>
        <h1>Barang Keluar</h1>
        <p>Distribusikan stok ke dapur atau cabang dengan validasi stok lokasi.</p>
      </div>
    </div>
    <section class="grid cols-2">
      <div class="panel">
        <h2 class="section-title">Tambah ke Daftar</h2>
        <form id="outbound-add" class="grid">
          <div class="form-grid">
            <div class="field">
              <label>Lokasi asal</label>
              <select name="sourceId">${optionHtml(storageLocations())}</select>
            </div>
            <div class="field">
              <label>Tujuan</label>
              <select name="destId" ${outboundCart.length ? "disabled" : ""}>${optionHtml(destinationLocations(), destinationId)}</select>
              ${outboundCart.length ? `<input name="destId" type="hidden" value="${destinationId}" /><small class="muted">      Tujuan dikunci sampai daftar dikosongkan.</small>` : ""}
            </div>
          </div>
          <div class="form-grid">
            <div class="field">
              <label>Barang</label>
              ${productPickerHtml({ id: "outbound-product-options", locationId: defaultSourceId })}
            </div>
            <div class="field">
              <label>Jumlah</label>
              <input name="quantity" type="number" min="1" value="1" required />
            </div>
          </div>
          <button class="btn" type="submit">Tambah ke Daftar</button>
        </form>
      </div>
      <div class="panel">
        <h2 class="section-title">Daftar Barang Keluar</h2>
        ${renderCart(outboundCart, "outbound")}
        <div class="actions" style="margin-top: 12px;">
          <button class="btn" data-action="submit-outbound">Submit Barang Keluar</button>
          <button class="btn ghost" data-action="clear-outbound">Kosongkan</button>
        </div>
      </div>
    </section>
  `;
}

function renderCart(cart, type) {
  if (!cart.length) return `<div class="muted">Daftar masih kosong.</div>`;
  return `
    <div class="cart-list">
      ${[...groupTransactionItemsByLocation(cart)]
        .map(([locationId, items]) => `
          <section class="cart-group">
            <div class="cart-group-title">${type === "inbound" ? "Penyimpanan" : "Asal"}: ${locationById(locationId)?.name || "-"}</div>
            ${items.map((item) => {
              const product = productById(item.productId);
              return `
                <div class="cart-row">
                  <div>
                    <strong>${product.name}</strong>
                    <div class="muted">${item.quantity} ${product.unit}${item.destId ? ` ke ${locationById(item.destId)?.name || "-"}` : ""}</div>
                  </div>
                  <button class="btn small danger" data-remove-cart="${type}" data-index="${cart.indexOf(item)}">Hapus</button>
                </div>
              `;
            }).join("")}
          </section>
        `)
        .join("")}
    </div>
  `;
}

function renderPurchase() {
  if (!canAccessRoute("purchase")) return renderAccessDenied();
  if (!canViewPurchaseDashboard() && purchaseMode === "dashboard") purchaseMode = "input";
  const draft = purchaseCart[0] || {
    date: todayInputValue(),
    outletLocationId: destinationLocations()[0]?.id || "",
    type: "PURCHASE",
    note: "",
  };
  const inputRecords = visiblePurchaseRecords()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const dashboardRecords = purchaseFilteredRecordList();
  return `
    <div class="page-head motion-fade">
      <div>
        <h1>Belanja Harian</h1>
        <p>Catat pengeluaran per outlet tanpa mengubah stok gudang. Item master barang akan menjadi referensi harga beli terakhir.</p>
      </div>
      ${canViewPurchaseDashboard() ? `<span class="badge">Admin</span>` : `<span class="badge warn">Input ${roleLabel()}</span>`}
    </div>
    ${canViewPurchaseDashboard() ? renderPurchaseModeTabs() : `<section class="panel staff-note"><strong>Mode input ${roleLabel()}</strong><span class="muted">Anda bisa mencatat belanja dan melihat catatan belanja. Dashboard belanja hanya tampil untuk Admin.</span></section>`}
    ${canViewPurchaseDashboard() && purchaseMode === "dashboard" ? renderPurchaseDashboardPage(dashboardRecords) : renderPurchaseInputPage(draft, inputRecords)}
  `;
}

function renderPurchaseModeTabs() {
  return `
    <div class="tabs purchase-mode-tabs">
      <button class="${purchaseMode === "input" ? "active" : ""}" data-purchase-mode="input">Input Belanja</button>
      <button class="${purchaseMode === "dashboard" ? "active" : ""}" data-purchase-mode="dashboard">Dashboard</button>
    </div>
  `;
}

function renderPurchaseInputPage(draft, records) {
  const latestRecords = records.slice(0, 9);
  return `
    <form id="purchase-add" class="purchase-input-form">
      <section class="panel purchase-entry-card">
        <div class="purchase-card-head">
          <div>
            <h2 class="section-title">Input Belanja</h2>
            <p class="muted">Tanggal, outlet, jenis, dan catatan dipakai untuk semua item dalam satu nota.</p>
          </div>
        </div>
          <div class="purchase-header-grid">
            <div class="field">
              <label>Tanggal</label>
              <input name="date" type="date" value="${draft.date}" required />
            </div>
            <div class="field">
              <label>Outlet</label>
              <select name="outletLocationId" required>${optionHtml(destinationLocations(), draft.outletLocationId)}</select>
            </div>
            <div class="field">
              <label>Jenis catatan</label>
              <select name="type">
                <option value="PURCHASE" ${draft.type === "PURCHASE" ? "selected" : ""}>Belanja normal</option>
                <option value="ADJUSTMENT" ${draft.type === "ADJUSTMENT" ? "selected" : ""}>Koreksi / penyesuaian</option>
              </select>
            </div>
            <div class="field">
              <label>Catatan</label>
              <input name="note" placeholder="Opsional" value="${escapeAttribute(draft.note || "")}" />
            </div>
          </div>
      </section>
      <section class="purchase-workspace">
        <div class="panel purchase-entry-card">
          <div class="purchase-card-head">
            <div>
              <h2 class="section-title">Tambah Item</h2>
              <p class="muted">CSV: nama, qty, satuan, harga.</p>
            </div>
            <div class="purchase-head-actions">
              <a class="btn ghost small" href="/template-nota-belanja.csv" download="template-nota-belanja.csv">Template CSV</a>
              <label class="btn secondary small file-btn">Upload CSV<input id="purchase-csv-upload" type="file" accept=".csv,text/csv" /></label>
              <span class="badge">${purchaseCart.length} item</span>
            </div>
          </div>
          <div class="purchase-item-grid quick-purchase-grid">
            <div class="field">
              <label>Item</label>
              <input name="itemName" list="purchase-product-options" placeholder="Nama barang / biaya" autocomplete="off" required />
              <input name="productId" type="hidden" value="" />
              <datalist id="purchase-product-options">${productOptionHtml()}</datalist>
            </div>
            <div class="field">
              <label>Satuan</label>
              <input name="unit" placeholder="pcs" required />
            </div>
            <div class="field">
              <label>Qty</label>
              <input name="quantity" type="number" step="1" value="1" required />
            </div>
            <div class="field">
              <label>Harga satuan</label>
              <input name="unitPrice" type="text" inputmode="numeric" placeholder="Rp" value="" autocomplete="off" required />
            </div>
            <button class="btn purchase-add-btn" type="submit">Tambah Item</button>
          </div>
        </div>
        <div class="panel purchase-entry-card">
          <div class="purchase-card-head">
            <div>
              <h2 class="section-title">Daftar Sementara</h2>
              <p class="muted">Periksa item sebelum disimpan sebagai catatan belanja.</p>
            </div>
          </div>
        ${renderPurchaseCart()}
        <div class="purchase-total"><span>Total sementara</span><strong>${formatCurrency(purchaseCart.reduce((sum, item) => sum + item.subtotal, 0))}</strong></div>
        <div class="actions" style="margin-top: 12px;">
          <button class="btn" type="button" data-action="submit-purchase">Simpan Belanja</button>
          <button class="btn ghost" type="button" data-action="clear-purchase">Kosongkan</button>
        </div>
      </div>
    </section>
    </form>
    <section class="panel data-panel purchase-history-panel">
      <div class="data-toolbar">
        <div>
          <h2 class="section-title">Catatan Belanja Terbaru</h2>
          <p class="muted">${isAdmin() ? "9 transaksi terbaru dari semua user." : "9 transaksi terbaru yang Anda input."}</p>
        </div>
      </div>
      <div class="purchase-record-list">
        ${latestRecords.length ? latestRecords.map(renderPurchaseRecordCard).join("") : emptyState("Belum ada belanja", "Catatan belanja harian akan muncul di sini.")}
      </div>
    </section>
  `;
}

function renderPurchaseDashboardPage(records) {
  const recordPeriodLabel = purchaseRecordPeriod === "month" ? purchaseFilterMonth : formatShortDate(purchaseFilterDate);
  const outletLabel = purchaseRecordOutletFilter === "all"
    ? "Semua outlet"
    : locationById(purchaseRecordOutletFilter)?.name || "Outlet dipilih";
  return `
    ${renderPurchaseDashboard()}
    <section class="panel data-panel purchase-history-panel">
      <div class="data-toolbar">
        <div>
          <h2 class="section-title">Catatan Belanja</h2>
          <p class="muted">${outletLabel} - ${recordPeriodLabel}${purchaseRecordSearch ? ` - pencarian "${escapeAttribute(purchaseRecordSearch)}"` : ""}.</p>
        </div>
        <form id="purchase-record-filter-form" class="purchase-record-filter">
          <select name="recordOutlet">
            <option value="all" ${purchaseRecordOutletFilter === "all" ? "selected" : ""}>Global</option>
            ${destinationLocations().map((location) => `<option value="${location.id}" ${Number(purchaseRecordOutletFilter) === location.id ? "selected" : ""}>${location.name}</option>`).join("")}
          </select>
          <select name="recordPeriod">
            <option value="day" ${purchaseRecordPeriod === "day" ? "selected" : ""}>Per hari</option>
            <option value="month" ${purchaseRecordPeriod === "month" ? "selected" : ""}>Per bulan</option>
          </select>
          <input name="recordSearch" type="search" placeholder="Cari ID, item, catatan" value="${escapeAttribute(purchaseRecordSearch)}" />
        </form>
      </div>
      <div class="purchase-record-list">
        ${records.length ? records.map(renderPurchaseRecordCard).join("") : emptyState("Belum ada belanja", "Tidak ada catatan yang cocok dengan filter ini.")}
      </div>
    </section>
  `;
}

function renderPurchaseDashboard() {
  const dateRecords = purchaseRecordsForDate(purchaseFilterDate);
  const monthRecords = purchaseRecordsForMonth(purchaseFilterMonth);
  const selectedRecords = purchaseRecordsForSelectedPeriod();
  const dateTotal = purchaseRecordsTotal(dateRecords);
  const monthTotal = purchaseRecordsTotal(monthRecords);
  const selectedTotal = purchaseRecordsTotal(selectedRecords);
  const selectedRecordIds = new Set(selectedRecords.map((record) => record.id));
  const selectedOutletTotals = purchaseOutletBreakdown(selectedRecords);
  const monthOutletTotals = purchaseOutletBreakdown(monthRecords);
  const itemTotals = purchaseTopItems(selectedRecordIds).slice(0, 5);
  const trendRows = purchaseDailyTrend(purchaseFilterMonth);
  const periodTitle = purchaseDashboardPeriod === "month" ? `Bulan ${purchaseFilterMonth}` : formatShortDate(purchaseFilterDate);
  return `
    <section class="panel purchase-filter-panel purchase-dashboard-controls">
      <form id="purchase-filter-form" class="purchase-filter-grid compact-purchase-filter">
        <div class="field purchase-period-control">
          <label>Dashboard</label>
          <div class="segmented-control">
            <button type="button" class="${purchaseDashboardPeriod === "day" ? "active" : ""}" data-purchase-period="day">Hari</button>
            <button type="button" class="${purchaseDashboardPeriod === "month" ? "active" : ""}" data-purchase-period="month">Bulan</button>
          </div>
        </div>
        <div class="field ${purchaseDashboardPeriod === "day" ? "" : "is-muted"}">
          <label>Tanggal</label>
          <input name="filterDate" type="date" value="${purchaseFilterDate}" />
        </div>
        <div class="field ${purchaseDashboardPeriod === "month" ? "" : "is-muted"}">
          <label>Bulan</label>
          <input name="filterMonth" type="month" value="${purchaseFilterMonth}" />
        </div>
        <button class="btn ghost" type="button" data-action="reset-purchase-filter">Hari Ini</button>
      </form>
    </section>
    <section class="grid cols-4 analytics-grid purchase-dashboard">
      <div class="stat"><span>Total terpilih</span><strong>${formatCurrency(selectedTotal)}</strong><small>${periodTitle}</small></div>
      <div class="stat"><span>Bulan dipilih</span><strong>${formatCurrency(monthTotal)}</strong><small>${purchaseFilterMonth}</small></div>
      <div class="stat accent"><span>Catatan terpilih</span><strong>${selectedRecords.length}</strong><small>${purchaseDashboardPeriod === "month" ? "Catatan bulan ini" : "Catatan hari ini"}</small></div>
      <div class="stat"><span>Item terpilih</span><strong>${purchaseItemsCount(selectedRecords)}</strong><small>Rincian item dalam periode</small></div>
    </section>
    <section class="grid cols-2 purchase-chart-grid">
      <div class="panel">
        <h2 class="section-title">Grafik Harian - ${purchaseFilterMonth}</h2>
        ${renderPurchaseTrendChart(trendRows)}
      </div>
      <div class="panel">
        <h2 class="section-title">Grafik Outlet - ${periodTitle}</h2>
        ${renderPurchaseOutletChart(selectedOutletTotals)}
      </div>
    </section>
    <section class="grid cols-2 purchase-summary-grid">
      <div class="panel">
        <h2 class="section-title">Belanja per Outlet - ${periodTitle}</h2>
        ${renderPurchaseOutletBreakdown(selectedOutletTotals, "Belum ada belanja di periode ini.")}
      </div>
      <div class="panel">
        <h2 class="section-title">Ringkasan Outlet Bulanan</h2>
        <div class="rank-list">${monthOutletTotals.some((row) => row.total !== 0) ? monthOutletTotals.filter((row) => row.total !== 0).slice(0, 5).map((row) => `<div><span>${row.location.name}<small>${row.records} catatan, ${row.items} item</small></span><strong>${formatCurrency(row.total)}</strong></div>`).join("") : `<div class="muted">Belum ada data outlet.</div>`}</div>
      </div>
    </section>
    <section class="grid cols-2 purchase-summary-grid">
      <div class="panel">
        <h2 class="section-title">Top Item</h2>
        <div class="rank-list">${itemTotals.length ? itemTotals.map((row) => `<div><span>${row.name}</span><strong>${formatCurrency(row.total)}</strong></div>`).join("") : `<div class="muted">Belum ada data item.</div>`}</div>
      </div>
      <div class="panel purchase-kpi-note">
        <h2 class="section-title">Catatan Filter</h2>
        <div class="purchase-insight-list">
          <div><span>Total hari</span><strong>${formatCurrency(dateTotal)}</strong></div>
          <div><span>Total bulan</span><strong>${formatCurrency(monthTotal)}</strong></div>
          <div><span>Catatan tampil</span><strong>${purchaseFilteredRecordList().length}</strong></div>
        </div>
      </div>
    </section>
  `;
}

function renderPurchaseOutletBreakdown(rows, emptyText) {
  const hasData = rows.some((row) => row.total !== 0 || row.records > 0);
  if (!hasData) return `<div class="muted">${emptyText}</div>`;
  return `
    <div class="outlet-spend-list">
      ${rows.map((row) => {
        const maxTotal = Math.max(...rows.map((item) => Math.abs(item.total)), 1);
        const percent = row.total ? Math.max(8, Math.round((Math.abs(row.total) / maxTotal) * 100)) : 0;
        return `
          <div class="outlet-spend-row ${row.total === 0 ? "is-empty" : ""}">
            <div class="outlet-spend-head">
              <span>${row.location.name}</span>
              <strong>${formatCurrency(row.total)}</strong>
            </div>
            <div class="outlet-spend-bar"><span style="width: ${percent}%"></span></div>
            <small>${row.records} catatan, ${row.items} item</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderPurchaseTrendChart(rows) {
  if (!rows.length) return emptyState("Belum ada grafik", "Belum ada belanja di bulan ini.");
  const maxTotal = Math.max(...rows.map((row) => Math.abs(row.total)), 1);
  return `
    <div class="purchase-chart purchase-trend-chart">
      ${rows.map((row) => {
        const height = Math.max(10, Math.round((Math.abs(row.total) / maxTotal) * 100));
        return `
          <div class="trend-column" title="${formatShortDate(row.date)} - ${formatCurrency(row.total)}">
            <div class="trend-bar"><span style="height: ${height}%"></span></div>
            <small>${row.date.slice(8, 10)}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderPurchaseOutletChart(rows) {
  const activeRows = rows.filter((row) => row.total !== 0).slice(0, 6);
  if (!activeRows.length) return emptyState("Belum ada grafik", "Belum ada belanja di periode ini.");
  const maxTotal = Math.max(...activeRows.map((row) => Math.abs(row.total)), 1);
  return `
    <div class="purchase-chart outlet-chart">
      ${activeRows.map((row) => {
        const percent = Math.max(8, Math.round((Math.abs(row.total) / maxTotal) * 100));
        return `
          <div class="outlet-chart-row">
            <div><strong>${row.location.name}</strong><small>${row.records} catatan, ${row.items} item</small></div>
            <div class="outlet-chart-track"><span style="width: ${percent}%"></span></div>
            <strong>${formatCurrency(row.total)}</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function purchaseTopItems(recordIds = null) {
  const totals = new Map();
  state.purchaseItems
    .filter((item) => !recordIds || recordIds.has(item.purchaseId))
    .forEach((item) => {
    const product = item.productId ? productById(item.productId) : null;
    const name = product ? product.name : item.freeName || "Item bebas";
    totals.set(name, (totals.get(name) || 0) + Number(item.subtotal || 0));
  });
  return Array.from(totals, ([name, total]) => ({ name, total })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

function renderPurchaseCart() {
  if (!purchaseCart.length) return `<div class="muted">Daftar masih kosong.</div>`;
  return `
    <div class="table-wrap compact-purchase-table">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${purchaseCart.map((item, index) => `
            <tr>
              <td>
                <input class="purchase-cart-input" data-purchase-cart-field="name" data-index="${index}" list="purchase-product-options" value="${escapeAttribute(item.name)}" />
                <div class="muted">${item.productId ? "Master barang" : "Item bebas"}</div>
              </td>
              <td class="purchase-cart-qty">
                <input class="purchase-cart-input" data-purchase-cart-field="quantity" data-index="${index}" type="number" step="1" value="${item.quantity}" />
                <input class="purchase-cart-input" data-purchase-cart-field="unit" data-index="${index}" value="${escapeAttribute(item.unit)}" ${item.productId ? "readonly" : ""} />
              </td>
              <td><input class="purchase-cart-input" data-purchase-cart-field="unitPrice" data-index="${index}" inputmode="numeric" value="${formatNumber(item.unitPrice)}" /></td>
              <td><strong>${formatCurrency(item.subtotal)}</strong></td>
              <td><button class="btn small danger" data-remove-cart="purchase" data-index="${index}">Hapus</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPurchaseRecordCard(record) {
  const outlet = locationById(record.outletLocationId);
  const user = state.users.find((item) => item.id === record.userId);
  const items = purchaseItemsFor(record.id);
  const rows = items.map((item) => {
    const product = item.productId ? productById(item.productId) : null;
    return `<div><span>${product ? product.name : item.freeName || "Item bebas"}</span><strong>${formatCurrency(item.subtotal)}</strong></div>`;
  });
  return `
    <article class="card purchase-card">
      <div class="transaction-card-head">
        <div class="transaction-card-title">
          <span class="badge ${record.type === "ADJUSTMENT" ? "warn" : ""}">${record.type === "ADJUSTMENT" ? "Koreksi" : "Belanja"}</span>
          <strong>${record.id}</strong>
        </div>
        <strong>${formatCurrency(purchaseTotal(record.id))}</strong>
      </div>
      <div class="transaction-card-meta">
        <span>${formatShortDate(record.date)}</span>
        <span>${outlet ? outlet.name : "-"}</span>
        <span>${user ? user.name : "-"}</span>
      </div>
      ${record.note ? `<div class="muted">${record.note}</div>` : ""}
      <div class="transaction-card-items">
        ${rows.slice(0, 3).join("")}
      </div>
      ${rows.length > 3 ? `<div class="purchase-card-footer"><details class="transaction-card-detail purchase-card-more"><summary>Lihat selengkapnya (${rows.length - 3} item lain)</summary><div class="transaction-card-extra">${rows.slice(3).join("")}</div></details></div>` : ""}
    </article>
  `;
}

function renderHistory() {
  return `
    <div class="page-head motion-fade">
      <div>
        <h1>Riwayat Transaksi</h1>
        <p>Lihat transaksi per ID atau pergerakan tiap barang dalam 30 hari terakhir.</p>
      </div>
    </div>
    <div class="tabs">
      <button class="${historyTab === "transaction" ? "active" : ""}" data-history-tab="transaction">Per Transaksi</button>
      <button class="${historyTab === "item" ? "active" : ""}" data-history-tab="item">Per Barang</button>
    </div>
    ${historyTab === "transaction" ? renderTransactionHistory() : renderItemHistory()}
  `;
}

function renderTransactionHistory() {
  const rows = [...state.transactions].reverse();
  const page = paginateRows(rows, historyPage, 9);
  historyPage = page.page;
  return `
    <section class="transaction-history-list">
      ${rows.length ? page.rows.map(renderTransactionCard).join("") : `<div class="panel muted">Belum ada transaksi.</div>`}
    </section>
    ${page.pageCount > 1 ? `
      <nav class="history-pagination" aria-label="Pagination riwayat transaksi">
        <button class="btn secondary small" data-history-page="${page.page - 1}" ${page.page === 1 ? "disabled" : ""}>← Sebelumnya</button>
        <span>Halaman ${page.page} dari ${page.pageCount}</span>
        <button class="btn secondary small" data-history-page="${page.page + 1}" ${page.page === page.pageCount ? "disabled" : ""}>Berikutnya →</button>
      </nav>
    ` : ""}
  `;
}

function renderTransactionCard(trx) {
  const user = state.users.find((item) => item.id === trx.userId);
  const items = state.transactionItems.filter(
    (item) => item.transactionId === trx.id,
  );
  const groups = [...groupTransactionItemsByLocation(items)];
  let visibleRemaining = 5;
  const visibleGroups = [];
  const hiddenGroups = [];
  groups.forEach(([locationId, groupItems]) => {
    const visibleItems = groupItems.slice(0, visibleRemaining);
    visibleRemaining -= visibleItems.length;
    if (visibleItems.length) visibleGroups.push([locationId, visibleItems]);
    if (visibleItems.length < groupItems.length) hiddenGroups.push([locationId, groupItems.slice(visibleItems.length)]);
  });
  const renderGroups = (groupList, showLocation = true) => groupList.map(([locationId, groupItems]) => `
    <section class="transaction-location-group">
      ${showLocation ? `<div class="transaction-location-title">${trx.type === "INBOUND" ? "Penyimpanan" : "Asal"}: ${locationById(locationId)?.name || "-"}</div>` : ""}
      <div class="transaction-location-items">
        ${groupItems.map((item) => {
          const product = productById(item.productId);
          return `<div><span>${product ? product.name : "Barang tidak ditemukan"}</span><strong>${item.quantity} ${product ? product.unit : ""}</strong></div>`;
        }).join("")}
      </div>
    </section>
  `).join("");
  const dest = locationById(trx.destLocationId);
  const locationText = trx.type === "INBOUND"
    ? groups.length === 1 ? locationById(groups[0][0])?.name || "-" : `${groups.length} lokasi penyimpanan`
    : `${groups.length === 1 ? locationById(groups[0][0])?.name || "-" : `${groups.length} lokasi asal`} -> ${dest?.name || "-"}`;
  return `
    <article class="card transaction-card">
      <div class="transaction-card-head">
        <div class="transaction-card-title">
          <strong>${trx.id}</strong>
          <span class="badge ${trx.type === "OUTBOUND" ? "warn" : ""}">${trx.type === "INBOUND" ? "Masuk" : "Keluar"}</span>
        </div>
        <button class="btn secondary small" data-share-trx="${trx.id}">Share WA</button>
      </div>
      <div class="transaction-card-meta">
        <span>${formatDate(trx.createdAt)}</span>
        <span>${user ? user.name : "-"}</span>
        <span>${locationText}</span>
      </div>
      <div class="transaction-card-items">
        ${renderGroups(visibleGroups)}
        ${hiddenGroups.length ? `
          <details class="transaction-card-detail">
            <summary>Lihat selengkapnya (${items.length - 5} item lain)</summary>
            <div class="transaction-card-extra">${renderGroups(hiddenGroups, groups.length > 1)}</div>
          </details>
        ` : ""}
      </div>
    </article>
  `;
}

function renderItemHistory() {
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const selectedProductId = Number(itemHistoryProductId);
  const selectedProduct = selectedProductId
    ? productById(selectedProductId)
    : null;
  const rows = state.transactionItems
    .map((item) => ({
      item,
      trx: state.transactions.find((trx) => trx.id === item.transactionId),
    }))
    .filter(
      (row) =>
        row.trx &&
        new Date(row.trx.createdAt).getTime() >= since &&
        selectedProductId &&
        row.item.productId === selectedProductId,
    )
    .reverse();
  const inboundTotal = rows
    .filter((row) => row.trx.type === "INBOUND")
    .reduce((sum, row) => sum + row.item.quantity, 0);
  const outboundTotal = rows
    .filter((row) => row.trx.type === "OUTBOUND")
    .reduce((sum, row) => sum + row.item.quantity, 0);
  const selectedStock = selectedProduct
    ? stockFor(selectedProduct.id, selectedProduct.locationId)
    : 0;
  return `
    <section class="panel" style="margin-bottom: 16px;">
      <h2 class="section-title">Cari Barang</h2>
      <p class="muted">Pilih nama barang dari dropdown untuk melihat stok saat ini dan pergerakan 30 hari terakhir.</p>
      <div class="field" style="margin-top: 14px;">
        <label>Nama Barang</label>
        <select id="item-history-product">
          <option value="">Pilih barang</option>
          ${activeProducts()
            .map(
              (product) =>
                `<option value="${product.id}" ${selectedProductId === product.id ? "selected" : ""}>${product.name}</option>`,
            )
            .join("")}
        </select>
      </div>
    </section>
    ${
      selectedProduct
        ? `
      <section class="stock-focus-card" style="margin-bottom: 16px;">
        <div class="stock-display">
          <span>Jumlah Sisa / Stok</span>
          <strong>${selectedStock} ${selectedProduct.unit}</strong>
          <small>${selectedProduct.name} - ${productLocation(selectedProduct.id)?.name || "-"}</small>
        </div>
      </section>

    `
        : ""
    }
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Barang</th>
              <th>Tipe</th>
              <th>Jumlah</th>
              <th>Lokasi / Tujuan</th>
              <th>Dicatat oleh</th>
            </tr>
          </thead>
          <tbody>
            ${selectedProduct ? (rows.length ? rows.map(renderItemHistoryRow).join("") : `<tr><td colspan="6" class="muted">Belum ada histori untuk barang ini dalam 30 hari terakhir.</td></tr>`) : `<tr><td colspan="6" class="muted">Pilih barang terlebih dahulu.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderItemHistoryRow(row) {
  const product = productById(row.item.productId);
  const source = locationById(row.item.locationId || product?.locationId);
  const dest = locationById(row.trx.destLocationId);
  const user = state.users.find((item) => item.id === row.trx.userId);
  return `
    <tr>
      <td>${formatDate(row.trx.createdAt)}</td>
      <td>${product.name}</td>
      <td><span class="badge ${row.trx.type === "OUTBOUND" ? "warn" : ""}">${row.trx.type === "INBOUND" ? "Masuk" : "Keluar"}</span></td>
      <td>${row.item.quantity} ${product.unit}</td>
      <td>${source ? source.name : "-"}${row.trx.type === "OUTBOUND" ? ` -> ${dest?.name || "-"}` : ""}</td>
      <td>${user ? user.name : "-"}</td>
    </tr>
  `;
}

function renderWarehouse() {
  const locations = storageLocations();
  const totalUnits = state.productStocks.reduce((sum, stock) => sum + Number(stock.quantity), 0) || 1;
  return `
    <div class="page-head compact-head motion-fade">
      <div>
        <span class="eyebrow">Warehouse management</span>
        <h2>Lokasi penyimpanan</h2>
        <p>Monitor sebaran stok, risiko low stock, dan kesiapan gudang dalam satu layar.</p>
      </div>
      <div class="actions">
        <button class="btn" data-route="inbound">Catat Masuk</button>
        <button class="btn ghost" data-route="outbound">Catat Keluar</button>
      </div>
    </div>
    <section class="warehouse-grid">
      ${locations
        .map((location) => {
          const products = productsForLocation(location.id);
          const units = locationStockTotal(location.id);
          const low = lowProductsForLocation(location.id);
          const percent = Math.max(8, Math.round((units / totalUnits) * 100));
          return `
            <article class="warehouse-card">
              <div class="warehouse-head">
                <div><span class="warehouse-icon">${icons.warehouse}</span></div>
                <div><h3>${location.name}</h3><p>${products.length} SKU aktif</p></div>
                <span class="badge ${low.length ? "warn" : ""}">${low.length ? `${low.length} low` : "Stabil"}</span>
              </div>
              <div class="capacity-bar"><span style="width: ${percent}%"></span></div>
              <div class="warehouse-metrics">
                <div><span>Total unit</span><strong>${units}</strong></div>
                <div><span>Min. alert</span><strong>${low.length}</strong></div>
              </div>
              <div class="mini-stock-list">
                ${products.slice(0, 4).map((product) => `<button data-detail-product="${product.id}"><span>${product.name}</span><strong>${stockFor(product.id, location.id)} ${product.unit}</strong></button>`).join("") || `<div class="muted">Belum ada barang.</div>`}
              </div>
            </article>
          `;
        })
        .join("")}
    </section>
    ${productDetailId ? renderProductDetailModal(productDetailId) : ""}
  `;
}

function masterVisibleProducts() {
  const query = masterSearchQuery.trim().toLowerCase();
  return activeProducts().filter((product) => {
    const locationName = productLocation(product.id)?.name || "";
    const matchesSearch = query
      ? `${product.name} ${locationName}`.toLowerCase().includes(query)
      : true;
    return (
      matchesSearch &&
      (!masterLowOnly || totalStock(product.id) <= product.minStock)
    );
  });
}

function renderMaster() {
  const products = masterVisibleProducts();
  const emptyColspan = isAdmin() ? 7 : 5;
  return `
    <div class="page-head motion-fade">
      <div>
        <h1>Master Data</h1>
        <p>Fokus utama halaman ini adalah data stok per lokasi. Tambah barang tersedia dari tombol aksi.</p>
      </div>
      <div class="actions">
        <button class="btn" data-action="open-product-modal">Tambah Barang</button>
        <button class="btn secondary" data-action="toggle-low">${masterLowOnly ? "Tampilkan Semua" : "Filter Low Stock"}</button>
        <button class="btn secondary" data-action="share-stock">Share Stok WA</button>
      </div>
    </div>
    <section class="panel data-panel">
      <div class="data-toolbar">
        <div class="master-search-block">
          <form id="master-search-form" class="master-search" role="search">
            <div class="field master-search-field">
              <label>Cari stok</label>
              <input name="query" value="${escapeAttribute(masterSearchQuery)}" placeholder="Nama barang atau lokasi" autocomplete="off" />
            </div>
            <button class="btn secondary" type="submit">Search</button>
            ${masterSearchQuery ? `<button class="btn ghost" type="button" data-action="clear-master-search">Reset</button>` : ""}
          </form>
          <p class="muted">${products.length} barang ditampilkan${masterLowOnly ? " dalam filter low stock" : ""}${masterSearchQuery ? ` untuk "${escapeAttribute(masterSearchQuery)}"` : ""}.</p>
        </div>
        ${canUseBulkImport() ? renderImportBox() : `<span class="badge">${roleLabel()}: tambah single item aktif</span>`}
      </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Barang</th>
                <th>Jumlah</th>
                <th>Min Stok</th>
                <th>Lokasi</th>
                ${isAdmin() ? "<th>Harga Beli Terakhir</th>" : ""}
                <th>Status</th>
                ${isAdmin() ? "<th>Aksi</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${products.map(renderProductRow).join("") || `<tr><td colspan="${emptyColspan}" class="muted">Tidak ada data.</td></tr>`}
            </tbody>
          </table>
        </div>
    </section>
    ${masterModalOpen ? renderProductModal() : ""}
    ${productDetailId ? renderProductDetailModal(productDetailId) : ""}
    ${csvImportPreview ? renderImportPreviewModal() : ""}
  `;
}

function renderProductDetailModal(productId) {
  const product = productById(productId);
  if (!product) return "";
  const location = productLocation(product.id);
  const quantity = stockFor(product.id, product.locationId);
  const low = quantity <= Number(product.minStock);
  const lastPurchase = isAdmin() ? lastPurchaseInfo(product.id) : null;
  const itemRows = state.transactionItems
    .map((item) => ({ item, trx: state.transactions.find((trx) => trx.id === item.transactionId) }))
    .filter((row) => row.trx && row.item.productId === product.id)
    .slice(-5)
    .reverse();
  return `
    <div class="modal-backdrop" data-action="close-product-detail">
      <section class="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
        <div class="modal-head">
          <div>
            <span class="eyebrow">Product detail</span>
            <h2 id="detail-modal-title">${product.name}</h2>
            <p class="muted">${location ? location.name : "-"} - satuan ${product.unit}</p>
          </div>
          <button class="icon-btn" type="button" data-action="close-product-detail" aria-label="Tutup">x</button>
        </div>
        <div class="detail-grid">
          <div class="detail-stat"><span>Stok saat ini</span><strong>${quantity} ${product.unit}</strong></div>
          <div class="detail-stat"><span>Minimum stok</span><strong>${product.minStock} ${product.unit}</strong></div>
          ${isAdmin() ? `<div class="detail-stat"><span>Harga beli terakhir</span><strong>${lastPurchase ? formatCurrency(lastPurchase.item.unitPrice) : "-"}</strong></div>` : ""}
          <div class="detail-stat"><span>Status</span><strong class="${low ? "text-danger" : "text-success"}">${low ? "Low" : "Aman"}</strong></div>
        </div>
        <div class="panel inner-panel">
          <h3 class="section-title">Aktivitas terbaru</h3>
          <div class="detail-activity">
            ${itemRows.length ? itemRows.map((row) => `<div><span class="badge ${row.trx.type === "OUTBOUND" ? "warn" : ""}">${row.trx.type === "INBOUND" ? "Masuk" : "Keluar"}</span><strong>${row.item.quantity} ${product.unit}</strong><small>${formatDate(row.trx.createdAt)}</small></div>`).join("") : emptyState("Belum ada aktivitas", "Riwayat produk ini akan muncul setelah transaksi pertama.")}
          </div>
        </div>
        <div class="actions" style="margin-top: 14px;">
          <button class="btn" data-route="inbound">Restock</button>
          <button class="btn ghost" data-route="outbound">Distribusi</button>
        </div>
      </section>
    </div>
  `;
}

function renderProductModal() {
  const editingProduct = masterEditingProductId
    ? productById(masterEditingProductId)
    : null;
  const title = editingProduct ? "Edit Barang" : "Tambah Barang";
  const submitLabel = editingProduct ? "Simpan Perubahan" : "Simpan Barang";
  return `
    <div class="modal-backdrop" data-action="close-product-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div class="modal-head">
          <div>
            <h2 id="product-modal-title">${title}</h2>
            <p class="muted">${editingProduct ? "Admin dapat mengubah nama, satuan, minimum stok, dan lokasi barang." : "Single item baru akan dibuat dengan stok awal 0 di satu lokasi penyimpanan."}</p>
          </div>
          <button class="btn ghost small" type="button" data-action="close-product-modal">Tutup</button>
        </div>
        <form id="product-form" class="grid">
          <div class="field">
            <label>Nama barang</label>
            <input name="name" placeholder="Contoh: Saus Tare" value="${editingProduct ? editingProduct.name : ""}" required autofocus />
          </div>
          <div class="form-grid">
            <div class="field">
              <label>Satuan</label>
              <input name="unit" placeholder="kg / pcs / pack" value="${editingProduct ? editingProduct.unit : ""}" required />
            </div>
            <div class="field">
              <label>Minimum stok</label>
              <input name="minStock" type="number" min="0" value="${editingProduct ? editingProduct.minStock : 0}" ${isAdmin() ? "" : "readonly"} />
            </div>
          </div>
          <div class="field">
            <label>Lokasi penyimpanan</label>
            <select name="locationId">${optionHtml(storageLocations(), editingProduct ? editingProduct.locationId : "")}</select>
          </div>
          ${isAdmin() ? "" : `<p class="muted">Untuk Staff, minimum stok otomatis 0 dan dapat dirapikan Admin nanti.</p>`}
          <div class="actions">
            <button class="btn" type="submit">${submitLabel}</button>
            <button class="btn ghost" type="button" data-action="close-product-modal">Batal</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderImportBox() {
  const templateUrl = "/template-master-barang.xlsx";
  return `
    <div class="actions">
      <a class="btn secondary" href="${templateUrl}" download="template-master-barang.xlsx">Download Template</a>
      <label class="btn secondary file-btn">
        Import Excel
        <input id="excel-import" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
      </label>
    </div>
  `;
}

function renderImportPreviewModal() {
  const rows = csvImportPreview.rows;
  const validCount = rows.filter((row) => row.valid).length;
  const invalidCount = rows.length - validCount;
  return `
    <div class="modal-backdrop" data-action="cancel-import-preview">
      <section class="modal wide-modal" role="dialog" aria-modal="true" aria-labelledby="import-preview-title">
        <div class="modal-head">
          <div>
            <h2 id="import-preview-title">Preview Import Excel</h2>
            <p class="muted">${validCount} valid, ${invalidCount} perlu diperbaiki. Data baru disimpan setelah tombol import ditekan.</p>
          </div>
          <button class="btn ghost small" type="button" data-action="cancel-import-preview">Tutup</button>
        </div>
        <div class="table-wrap import-preview-table">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Satuan</th>
                <th>Min Stok</th>
                <th>Stok Saat Ini</th>
                <th>Lokasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row) => `
                    <tr>
                      <td>${row.name || "-"}</td>
                      <td>${row.unit || "-"}</td>
                      <td>${row.minStock}</td>
                      <td>${row.quantity || 0}</td>
                      <td>${row.locationName || "Gudang Utama"}</td>
                      <td><span class="badge ${row.valid ? "" : "danger"}">${row.valid ? "Siap" : row.error}</span></td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div class="actions" style="margin-top: 14px;">
          <button class="btn" data-action="confirm-import-preview" ${validCount ? "" : "disabled"}>Import ${validCount} Barang</button>
          <button class="btn ghost" data-action="cancel-import-preview">Batal</button>
        </div>
      </section>
    </div>
  `;
}

function renderProductRow(product) {
  const location = productLocation(product.id);
  const quantity = stockFor(product.id, product.locationId);
  const low = quantity <= Number(product.minStock);
  const lastPurchase = isAdmin() ? lastPurchaseInfo(product.id) : null;
  return `
    <tr>
      <td><strong>${product.name}</strong><div class="muted">${product.unit}</div></td>
      <td>${quantity} ${product.unit}</td>
      <td>${product.minStock} ${product.unit}</td>
      <td>${location ? location.name : "-"}</td>
      ${isAdmin() ? `<td>${lastPurchase ? `<strong>${formatCurrency(lastPurchase.item.unitPrice)}</strong><div class="muted">${formatShortDate(lastPurchase.record.date)}</div>` : `<span class="muted">-</span>`}</td>` : ""}
      <td><span class="badge ${low ? "danger" : ""}">${low ? "Low" : "Aman"}</span></td>
      ${isAdmin() ? `<td><div class="table-actions"><button class="icon-btn soft" title="Detail" data-detail-product="${product.id}">${icons.eye}</button><button class="icon-btn soft" title="Edit" data-edit-product="${product.id}">${icons.edit}</button><button class="icon-btn danger" title="Nonaktifkan" data-delete-product="${product.id}">${icons.trash}</button></div></td>` : ""}
    </tr>
  `;
}

function bindPageEvents() {
  if (route === "dashboard" || route === "master") {
    document
      .querySelectorAll('[data-action="share-stock"]')
      .forEach((button) => button.addEventListener("click", shareStock));
  }

  if (route === "inbound") bindInbound();
  if (route === "outbound") bindOutbound();
  if (route === "purchase") bindPurchase();
  if (route === "history") bindHistory();
  if (route === "master") bindMaster();

  document.querySelectorAll("[data-detail-product]").forEach((button) => {
    button.addEventListener("click", () => {
      productDetailId = Number(button.dataset.detailProduct);
      render();
    });
  });
  document.querySelectorAll('[data-action="close-product-detail"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      if (
        event.target !== event.currentTarget &&
        event.currentTarget.classList.contains("modal-backdrop")
      )
        return;
      productDetailId = null;
      render();
    });
  });

  document.querySelectorAll("[data-remove-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const cart = button.dataset.removeCart === "inbound"
        ? inboundCart
        : button.dataset.removeCart === "outbound"
          ? outboundCart
          : purchaseCart;
      cart.splice(Number(button.dataset.index), 1);
      render();
    });
  });
}

function bindInbound() {
  const formElement = document.getElementById("inbound-add");
  bindProductSearch(formElement);
  formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get("quantity"));
    const productId = Number(form.get("productId"));
    const product = productById(productId);
    if (quantity <= 0) return toast("Jumlah harus lebih dari 0.");
    if (!product)
      return toast("Pilih barang dari daftar yang tersedia.");
    inboundCart.push({
      productId,
      locationId: product.locationId,
      quantity,
    });
    render();
  });
  document
    .querySelector('[data-action="submit-inbound"]')
    .addEventListener("click", submitInbound);
  document
    .querySelector('[data-action="clear-inbound"]')
    .addEventListener("click", () => {
      inboundCart = [];
      render();
    });
}

function bindOutbound() {
  const formElement = document.getElementById("outbound-add");
  bindProductSearch(formElement, "sourceId");
  formElement.sourceId.addEventListener("change", () =>
    updateProductSelectForLocation(formElement, "sourceId"),
  );
  formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sourceId = Number(form.get("sourceId"));
    const destId = Number(form.get("destId"));
    const productId = Number(form.get("productId"));
    const product = productById(productId);
    const quantity = Number(form.get("quantity"));
    const alreadyInCart = outboundCart
      .filter(
        (item) => item.sourceId === sourceId && item.productId === productId,
      )
      .reduce((sum, item) => sum + item.quantity, 0);
    if (quantity <= 0) return toast("Jumlah harus lebih dari 0.");
    if (!product)
      return toast("Tidak ada barang yang bisa dipilih di lokasi ini.");
    if (product.locationId !== sourceId) {
      return toast(
        `Barang ${product.name} hanya tersedia dari ${productLocation(product.id).name}.`,
      );
    }
    if (outboundCart.length && outboundCart[0].destId !== destId) {
      return toast("Satu transaksi barang keluar hanya boleh memakai satu tujuan.");
    }
    if (stockFor(productId, sourceId) < quantity + alreadyInCart) {
      return toast("Stok lokasi tidak cukup untuk barang tersebut.");
    }
    outboundCart.push({
      productId,
      sourceId,
      destId,
      quantity,
    });
    render();
  });
  document
    .querySelector('[data-action="submit-outbound"]')
    .addEventListener("click", submitOutbound);
  document
    .querySelector('[data-action="clear-outbound"]')
    .addEventListener("click", () => {
      outboundCart = [];
      render();
    });
}

function bindPurchase() {
  document.querySelectorAll("[data-purchase-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      purchaseMode = button.dataset.purchaseMode;
      render();
    });
  });
  document.querySelectorAll("[data-purchase-period]").forEach((button) => {
    button.addEventListener("click", () => {
      purchaseDashboardPeriod = button.dataset.purchasePeriod;
      purchaseRecordPeriod = purchaseDashboardPeriod;
      render();
    });
  });
  const filterForm = document.getElementById("purchase-filter-form");
  if (filterForm) {
    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      purchaseFilterDate = String(form.get("filterDate") || todayInputValue());
      purchaseFilterMonth = String(form.get("filterMonth") || purchaseFilterDate.slice(0, 7));
      render();
    });
    filterForm.filterDate.addEventListener("change", () => {
      purchaseFilterDate = filterForm.filterDate.value || todayInputValue();
      if (purchaseDashboardPeriod === "day") purchaseRecordPeriod = "day";
      render();
    });
    filterForm.filterMonth.addEventListener("change", () => {
      purchaseFilterMonth = filterForm.filterMonth.value || todayInputValue().slice(0, 7);
      if (purchaseDashboardPeriod === "month") purchaseRecordPeriod = "month";
      render();
    });
  }
  const recordFilterForm = document.getElementById("purchase-record-filter-form");
  if (recordFilterForm) {
    const applyRecordFilter = () => {
      purchaseRecordOutletFilter = recordFilterForm.recordOutlet.value || "all";
      purchaseRecordPeriod = recordFilterForm.recordPeriod.value || "day";
      purchaseRecordSearch = recordFilterForm.recordSearch.value || "";
      render();
    };
    recordFilterForm.addEventListener("submit", (event) => event.preventDefault());
    recordFilterForm.recordOutlet.addEventListener("change", applyRecordFilter);
    recordFilterForm.recordPeriod.addEventListener("change", applyRecordFilter);
    recordFilterForm.recordSearch.addEventListener("input", () => {
      purchaseRecordOutletFilter = recordFilterForm.recordOutlet.value || "all";
      purchaseRecordPeriod = recordFilterForm.recordPeriod.value || "day";
      purchaseRecordSearch = recordFilterForm.recordSearch.value || "";
      clearTimeout(purchaseSearchDebounce);
      purchaseSearchDebounce = setTimeout(render, 250);
    });
  }
  const resetFilter = document.querySelector('[data-action="reset-purchase-filter"]');
  if (resetFilter) {
    resetFilter.addEventListener("click", () => {
      purchaseFilterDate = todayInputValue();
      purchaseFilterMonth = purchaseFilterDate.slice(0, 7);
      purchaseDashboardPeriod = "day";
      purchaseRecordPeriod = "day";
      render();
    });
  }
  const formElement = document.getElementById("purchase-add");
  if (!formElement) return;
  const updateUnitLock = () => updatePurchaseUnitLock(formElement);
  updateUnitLock();
  formElement.itemName.addEventListener("input", updateUnitLock);
  const updatePricePreview = () => updatePurchasePriceInput(formElement);
  updatePricePreview();
  formElement.unitPrice.addEventListener("input", () => {
    delete formElement.unitPrice.dataset.autofilledProduct;
    updatePricePreview();
  });
  formElement.unitPrice.addEventListener("blur", updatePricePreview);
  formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const itemName = String(form.get("itemName") || "").trim();
    const quantity = Number(form.get("quantity"));
    const unitPrice = parseCurrencyInput(form.get("unitPrice"));
    if (!itemName) return toast("Nama item belanja wajib diisi.");
    const header = purchaseCartHeaderFromForm(formElement);
    const item = purchaseCartItemFromInput(header, { name: itemName, quantity, unitPrice, unit: form.get("unit") });
    if (!item?.unit) return toast("Satuan wajib diisi.");
    if (header.type === "PURCHASE" && quantity <= 0) return toast("Jumlah belanja normal harus lebih dari 0.");
    if (header.type === "PURCHASE" && unitPrice < 0) return toast("Harga belanja normal tidak boleh negatif.");
    if (header.type === "ADJUSTMENT" && quantity === 0) return toast("Jumlah koreksi tidak boleh 0.");
    if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return toast("Jumlah dan harga harus angka valid.");
    if (!canUsePurchaseCartHeader(header)) return;
    purchaseCart.push(item);
    render();
    const nextItemInput = document.querySelector('#purchase-add input[name="itemName"]');
    if (nextItemInput) nextItemInput.focus();
  });
  const csvUpload = document.getElementById("purchase-csv-upload");
  if (csvUpload) csvUpload.addEventListener("change", (event) => importPurchaseCsv(event, formElement));
  document.querySelectorAll("[data-purchase-cart-field]").forEach((input) => {
    input.addEventListener("change", () => {
      const item = purchaseCart[Number(input.dataset.index)];
      if (!item) return;
      if (input.dataset.purchaseCartField === "name") {
        const product = findProductFromSearch(input.value) || findProductByName(input.value);
        item.productId = product ? product.id : null;
        item.freeName = product ? null : input.value.trim();
        item.name = product ? product.name : input.value.trim();
        item.unit = product ? product.unit : item.unit;
      } else if (input.dataset.purchaseCartField === "quantity") {
        item.quantity = Number(input.value);
      } else if (input.dataset.purchaseCartField === "unitPrice") {
        item.unitPrice = parseCurrencyInput(input.value);
      } else {
        item.unit = input.value.trim();
      }
      item.subtotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      render();
    });
  });
  document
    .querySelector('[data-action="submit-purchase"]')
    .addEventListener("click", submitPurchase);
  document
    .querySelector('[data-action="clear-purchase"]')
    .addEventListener("click", () => {
      purchaseCart = [];
      render();
    });
}

function updateProductSelectForLocation(formElement, locationFieldName) {
  const locationId = formElement[locationFieldName].value;
  const products = productOptionsForLocation(locationId);
  const productSearch = formElement.productSearch;
  productSearch.disabled = !products.length;
  productSearch.value = "";
  formElement.productId.value = "";
  formElement.querySelector("datalist").innerHTML = productOptionHtml(locationId);
}

function bindProductSearch(formElement, locationFieldName) {
  formElement.productSearch.addEventListener("input", () => {
    const product = findProductFromSearch(
      formElement.productSearch.value,
      locationFieldName ? formElement[locationFieldName].value : "",
    );
    formElement.productId.value = product ? product.id : "";
  });
}

function bindHistory() {
  document.querySelectorAll("[data-history-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      historyTab = button.dataset.historyTab;
      render();
    });
  });
  document.querySelectorAll("[data-history-page]").forEach((button) => {
    button.addEventListener("click", () => {
      historyPage = Number(button.dataset.historyPage);
      render();
    });
  });
  const itemHistoryProduct = document.getElementById("item-history-product");
  if (itemHistoryProduct) {
    itemHistoryProduct.addEventListener("change", () => {
      itemHistoryProductId = itemHistoryProduct.value;
      render();
    });
  }
  document.querySelectorAll("[data-share-trx]").forEach((button) => {
    button.addEventListener("click", () =>
      shareTransaction(button.dataset.shareTrx),
    );
  });
}

function bindMaster() {
  const productForm = document.getElementById("product-form");
  if (productForm) {
    productForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      saveProduct({
        id: masterEditingProductId,
        name: form.get("name"),
        unit: form.get("unit"),
        minStock: isAdmin() ? Number(form.get("minStock")) : 0,
        locationId: Number(form.get("locationId")),
      });
    });
  }
  document
    .querySelector('[data-action="open-product-modal"]')
    .addEventListener("click", () => {
      masterModalOpen = true;
      masterEditingProductId = null;
      render();
    });
  document
    .querySelectorAll('[data-action="close-product-modal"]')
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        if (
          event.target !== event.currentTarget &&
          event.currentTarget.classList.contains("modal-backdrop")
        )
          return;
        masterModalOpen = false;
        masterEditingProductId = null;
        render();
      });
    });
  document
    .querySelector('[data-action="toggle-low"]')
    .addEventListener("click", () => {
      masterLowOnly = !masterLowOnly;
      render();
    });
  const masterSearchForm = document.getElementById("master-search-form");
  if (masterSearchForm) {
    masterSearchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      masterSearchQuery = String(form.get("query") || "").trim();
      render();
    });
  }
  const clearMasterSearch = document.querySelector(
    '[data-action="clear-master-search"]',
  );
  if (clearMasterSearch) {
    clearMasterSearch.addEventListener("click", () => {
      masterSearchQuery = "";
      render();
    });
  }
  document.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", () =>
      deleteProduct(Number(button.dataset.deleteProduct)),
    );
  });
  document.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => {
      masterEditingProductId = Number(button.dataset.editProduct);
      masterModalOpen = true;
      render();
    });
  });
  const excelInput = document.getElementById("excel-import");
  if (excelInput) excelInput.addEventListener("change", importExcel);
  document
    .querySelectorAll('[data-action="cancel-import-preview"]')
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        if (
          event.target !== event.currentTarget &&
          event.currentTarget.classList.contains("modal-backdrop")
        )
          return;
        csvImportPreview = null;
        render();
      });
    });
  const confirmImport = document.querySelector(
    '[data-action="confirm-import-preview"]',
  );
  if (confirmImport) confirmImport.addEventListener("click", confirmExcelImport);
}

async function saveProduct(input) {
  const name = String(input.name || "").trim();
  const unit = String(input.unit || "").trim();
  const minStock = Number(input.minStock || 0);
  const locationId = Number(input.locationId || 0);
  if (!name || !unit) return toast("Nama barang dan satuan wajib diisi.");
  if (minStock < 0) return toast("Minimum stok tidak boleh negatif.");
  if (!locationById(locationId))
    return toast("Lokasi penyimpanan wajib dipilih.");
  const duplicate = state.products.some(
    (product) =>
      product.id !== input.id &&
      product.name.toLowerCase() === name.toLowerCase() &&
      product.active !== false,
  );
  if (duplicate) return toast("Nama barang sudah ada.");

  if (input.id) {
    if (!isAdmin()) return toast("Hanya Admin yang bisa mengedit barang.");
    const product = productById(input.id);
    if (!product) return toast("Barang tidak ditemukan.");
    const previousLocationId = product.locationId;
    const quantity = stockFor(product.id, previousLocationId);
    product.name = name;
    product.unit = unit;
    product.minStock = minStock;
    product.locationId = locationId;
    state.productStocks = state.productStocks.filter(
      (stock) => stock.productId !== product.id,
    );
    setStock(product.id, locationId, quantity);
    if (!(await saveState("product-update"))) return;
    masterModalOpen = false;
    masterEditingProductId = null;
    toast("Barang berhasil diperbarui.");
    render();
    return;
  }

  const product = {
    id: nextId(state.products),
    name,
    unit,
    minStock,
    locationId,
    active: true,
  };
  state.products.push(product);
  setStock(product.id, locationId, 0);
  if (!(await saveState("product-create"))) return;
  masterModalOpen = false;
  masterEditingProductId = null;
  toast("Barang berhasil ditambahkan.");
  render();
}

async function deleteProduct(productId) {
  const product = productById(productId);
  if (!product || !isAdmin()) return;
  product.active = false;
  if (!(await saveState("product-deactivate"))) return;
  toast("Barang dinonaktifkan.");
  render();
}

async function submitInbound() {
  if (!inboundCart.length) return toast("Daftar barang masuk masih kosong.");
  if (
    !window.confirm(
      `Simpan ${inboundCart.length} item barang masuk sebagai satu transaksi?`,
    )
  )
    return;
  const id = trxId();
  const locations = new Set(inboundCart.map((item) => item.locationId));
  state.transactions.push({
    id,
    type: "INBOUND",
    userId: currentUser().id,
    sourceLocationId: locations.size === 1 ? [...locations][0] : null,
    destLocationId: null,
    createdAt: new Date().toISOString(),
  });
  inboundCart.forEach((item) => {
    state.transactionItems.push({
      id: nextId(state.transactionItems),
      transactionId: id,
      productId: item.productId,
      locationId: item.locationId,
      quantity: item.quantity,
    });
    setStock(
      item.productId,
      item.locationId,
      stockFor(item.productId, item.locationId) + item.quantity,
    );
  });
  if (!(await saveState("inbound"))) return;
  inboundCart = [];
  toast(`Transaksi ${id} tersimpan.`);
  route = "history";
  historyTab = "transaction";
  historyPage = 1;
  render();
}

async function submitOutbound() {
  if (!outboundCart.length) return toast("Daftar barang keluar masih kosong.");
  for (const item of outboundCart) {
    if (stockFor(item.productId, item.sourceId) < item.quantity) {
      return toast("Ada stok yang tidak cukup. Periksa daftar keluar.");
    }
  }
  if (
    !window.confirm(
      `Simpan ${outboundCart.length} item barang keluar sebagai satu transaksi?`,
    )
  )
    return;
  const id = trxId();
  const first = outboundCart[0];
  const locations = new Set(outboundCart.map((item) => item.sourceId));
  state.transactions.push({
    id,
    type: "OUTBOUND",
    userId: currentUser().id,
    sourceLocationId: locations.size === 1 ? first.sourceId : null,
    destLocationId: first.destId,
    createdAt: new Date().toISOString(),
  });
  outboundCart.forEach((item) => {
    state.transactionItems.push({
      id: nextId(state.transactionItems),
      transactionId: id,
      productId: item.productId,
      locationId: item.sourceId,
      quantity: item.quantity,
    });
    setStock(
      item.productId,
      item.sourceId,
      stockFor(item.productId, item.sourceId) - item.quantity,
    );
  });
  if (!(await saveState("outbound"))) return;
  outboundCart = [];
  toast(`Transaksi ${id} tersimpan.`);
  route = "history";
  historyTab = "transaction";
  historyPage = 1;
  render();
}

async function submitPurchase() {
  if (!purchaseCart.length) return toast("Daftar belanja masih kosong.");
  const first = purchaseCart[0];
  const outlet = locationById(first.outletLocationId);
  if (!outlet || outlet.type !== "DESTINATION") return toast("Outlet wajib memakai lokasi tujuan.");
  if (
    !window.confirm(
      `Simpan ${purchaseCart.length} item ${first.type === "ADJUSTMENT" ? "koreksi" : "belanja"} dengan total ${formatCurrency(purchaseCart.reduce((sum, item) => sum + item.subtotal, 0))}?`,
    )
  )
    return;
  const id = purchaseId();
  state.purchaseRecords.push({
    id,
    outletLocationId: first.outletLocationId,
    userId: currentUser().id,
    date: first.date,
    note: first.note,
    type: first.type,
    createdAt: new Date().toISOString(),
  });
  purchaseCart.forEach((item) => {
    state.purchaseItems.push({
      id: nextId(state.purchaseItems),
      purchaseId: id,
      productId: item.productId,
      freeName: item.freeName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    });
  });
  if (!(await saveState("purchase"))) return;
  purchaseFilterDate = first.date;
  purchaseFilterMonth = first.date.slice(0, 7);
  purchaseCart = [];
  toast(`Catatan belanja ${id} tersimpan.`);
  route = "purchase";
  render();
}

function transactionText(trxIdValue) {
  const trx = state.transactions.find((item) => item.id === trxIdValue);
  if (!trx) return "";
  const user = state.users.find((item) => item.id === trx.userId);
  const dest = locationById(trx.destLocationId);
  const groups = [...groupTransactionItemsByLocation(state.transactionItems.filter((item) => item.transactionId === trx.id))];
  const lines = [
    `*${trx.type === "INBOUND" ? "BARANG MASUK" : "BARANG KELUAR"}*`,
    `ID: ${trx.id}`,
    `Tanggal: ${formatDate(trx.createdAt)}`,
  ];
  if (dest) lines.push(`Tujuan: ${dest.name}`);
  lines.push(`Dicatat oleh: ${user ? user.name : "-"}`, "", "Daftar Barang:");
  groups.forEach(([locationId, items]) => {
    lines.push("", `${trx.type === "INBOUND" ? "Penyimpanan" : "Asal"}: ${locationById(locationId)?.name || "-"}`);
    items.forEach((item, index) => {
      const product = productById(item.productId);
      lines.push(
        `${index + 1}. ${product.name} - ${item.quantity} ${product.unit}`,
      );
    });
  });
  return lines.join("\n");
}

function masterStockContextLabel() {
  const filters = [];
  if (masterLowOnly) filters.push("Low stock");
  if (masterSearchQuery.trim()) filters.push(`Cari: ${masterSearchQuery.trim()}`);
  return filters.length ? filters.join(" | ") : "Semua stok";
}

function stockText(products = activeProducts(), contextLabel = "") {
  const lines = [
    "*STOK GUDANG*",
    `Tanggal: ${formatDate(new Date().toISOString())}`,
  ];

  if (contextLabel) lines.push(`Filter: ${contextLabel}`);
  lines.push("");

  storageLocations().forEach((location) => {
    const productsInLocation = products.filter(
      (product) => product.locationId === location.id,
    );
    if (!productsInLocation.length) return;
    lines.push(`${location.name}:`);
    productsInLocation.forEach((product) => {
      const quantity = stockFor(product.id, location.id);
      lines.push(`- ${product.name}: ${quantity} ${product.unit}`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

function openWhatsApp(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function shareTransaction(id) {
  openWhatsApp(transactionText(id));
}

function shareStock() {
  const products = route === "master" ? masterVisibleProducts() : activeProducts();
  if (!products.length) {
    toast("Tidak ada stok yang bisa dibagikan dari tampilan ini.");
    return;
  }
  openWhatsApp(stockText(products, route === "master" ? masterStockContextLabel() : ""));
}

async function importExcel(event) {
  const file = event.target.files[0];
  if (!file || !canUseBulkImport()) return;
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    toast("Gunakan file Excel .xlsx dari template.");
    event.target.value = "";
    return;
  }

  try {
    const response = await fetch(`${API_BASE || "/api"}/import-preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      body: await file.arrayBuffer(),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Preview import gagal");
    }
    csvImportPreview = await response.json();
    render();
  } catch (error) {
    toast("File Excel tidak bisa dibaca. Pastikan memakai template .xlsx.");
  } finally {
    event.target.value = "";
  }
}

async function confirmExcelImport() {
  if (!csvImportPreview || !canUseBulkImport()) return;
  const validRows = csvImportPreview.rows.filter((row) => row.valid);
  validRows.forEach((row) => {
    const product = {
      id: nextId(state.products),
      name: row.name,
      unit: row.unit,
      minStock: row.minStock,
      locationId: row.locationId,
      active: true,
    };
    state.products.push(product);
    setStock(product.id, product.locationId, Number(row.quantity || 0));
  });
  if (!(await saveState("import"))) return;
  csvImportPreview = null;
  toast(`${validRows.length} barang berhasil diimport.`);
  render();
}

render();
hydrateStateFromBackend();
