/**
 * Pushes the Prisma schema to Turso (libSQL) directly.
 * Run with: node scripts/push-turso.mjs
 */
import { createClient } from "@libsql/client";

const url   = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error("❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.");
  process.exit(1);
}

const client = createClient({ url, authToken: token });

const statements = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "email"     TEXT NOT NULL UNIQUE,
    "name"      TEXT NOT NULL,
    "phone"     TEXT,
    "role"      TEXT NOT NULL DEFAULT 'PARENT',
    "password"  TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "Booking" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "userId"        TEXT,
    "parentName"    TEXT NOT NULL,
    "parentEmail"   TEXT NOT NULL,
    "childName"     TEXT NOT NULL,
    "childAge"      TEXT NOT NULL,
    "grade"         TEXT NOT NULL,
    "timezone"      TEXT NOT NULL,
    "subject"       TEXT NOT NULL,
    "tutorName"     TEXT NOT NULL,
    "tutorInitials" TEXT NOT NULL,
    "date"          TEXT NOT NULL,
    "timeSlot"      TEXT NOT NULL,
    "notes"         TEXT NOT NULL DEFAULT '',
    "monthlyPrice"  INTEGER NOT NULL,
    "status"        TEXT NOT NULL DEFAULT 'PENDING',
    "zoomLink"      TEXT,
    "zoomStartUrl"  TEXT,
    "zoomMeetingId" TEXT,
    "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
  )`,

  `CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "subject"   TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "OtpCode" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "email"     TEXT NOT NULL,
    "code"      TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used"      INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

console.log("🔄 Pushing schema to Turso...\n");

for (const sql of statements) {
  const table = sql.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1];
  try {
    await client.execute(sql);
    console.log(`✅ Table "${table}" ready`);
  } catch (err) {
    console.error(`❌ Failed on "${table}":`, err.message);
    process.exit(1);
  }
}

console.log("\n🎉 All tables created successfully in Turso!");
client.close();
