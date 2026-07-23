const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
  schema: "./db/schema.js",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:data/cekgudang.db",
  },
});
