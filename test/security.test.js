const assert = require("node:assert/strict");
const { assertStateRevision, createSessionToken, hashPassword, readSessionToken, verifyPassword } = require("../server");

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
