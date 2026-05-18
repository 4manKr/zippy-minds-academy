import "dotenv/config";
import { defineConfig } from "prisma/config";

const tursoUrl   = process.env["TURSO_DATABASE_URL"];
const tursoToken = process.env["TURSO_AUTH_TOKEN"];

// Use Turso when TURSO_DATABASE_URL is set, otherwise fall back to local SQLite
const datasourceUrl = tursoUrl?.startsWith("libsql://")
  ? `${tursoUrl}?authToken=${tursoToken}`
  : (process.env["DATABASE_URL"] ?? "file:./dev.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
