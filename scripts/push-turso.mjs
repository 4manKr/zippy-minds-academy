/**
 * Pushes schema changes to Turso (libSQL) directly.
 * Safe to re-run — skips already-existing tables/columns.
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

// Each entry: [label, sql]
const statements = [
  // ── Existing tables ───────────────────────────────────────────────────────
  ["User table", `CREATE TABLE IF NOT EXISTS "User" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "email"          TEXT NOT NULL UNIQUE,
    "name"           TEXT NOT NULL,
    "phone"          TEXT,
    "role"           TEXT NOT NULL DEFAULT 'PARENT',
    "password"       TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],

  ["User.approvalStatus column (ALTER)", `ALTER TABLE "User" ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'APPROVED'`],

  ["Booking table", `CREATE TABLE IF NOT EXISTS "Booking" (
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
  )`],

  ["ContactMessage table", `CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "subject"   TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],

  ["OtpCode table", `CREATE TABLE IF NOT EXISTS "OtpCode" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "email"     TEXT NOT NULL,
    "code"      TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used"      INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],

  // ── New tables ─────────────────────────────────────────────────────────────
  ["SupportTicket table", `CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "from"      TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "subject"   TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "priority"  TEXT NOT NULL DEFAULT 'medium',
    "status"    TEXT NOT NULL DEFAULT 'open',
    "reply"     TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],

  ["Course table", `CREATE TABLE IF NOT EXISTS "Course" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "name"        TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL DEFAULT '',
    "price"       INTEGER NOT NULL DEFAULT 199,
    "status"      TEXT NOT NULL DEFAULT 'active',
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],

  ["PlatformSetting table", `CREATE TABLE IF NOT EXISTS "PlatformSetting" (
    "id"    TEXT NOT NULL PRIMARY KEY,
    "key"   TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL
  )`],

  // ── Seed courses ──────────────────────────────────────────────────────────
  ["Seed courses", `INSERT OR IGNORE INTO "Course" ("id","name","description","price","status") VALUES
    ('c1','Phonics','Letter sounds, blending and reading foundations',199,'active'),
    ('c2','English Grammar','Sentence structure, vocabulary and writing skills',219,'active'),
    ('c3','Mathematics','Numbers, operations and problem solving',229,'active'),
    ('c4','Public Speaking','Confidence, articulation and presentation skills',219,'active'),
    ('c5','Writing & Communication','Creative and academic writing skills',199,'active'),
    ('c6','Coding','Programming basics with Scratch and Python',249,'active'),
    ('c7','Science','Life science, earth science and experiments',229,'active'),
    ('c8','Life Skills','Critical thinking, emotional intelligence',199,'active'),
    ('c9','Hindi','Reading, writing and conversational Hindi',199,'active'),
    ('c10','General Knowledge','Current affairs and world awareness',199,'active'),
    ('c11','Creative Arts','Drawing, craft and self-expression',199,'active'),
    ('c12','Social Studies','History, geography and civics',199,'active')`],

  // ── Seed default platform settings ───────────────────────────────────────
  ["Seed platform settings", `INSERT OR IGNORE INTO "PlatformSetting" ("id","key","value") VALUES
    ('ps1','siteName','Zippy Minds Academy'),
    ('ps2','contactEmail','hello@zippymindsacademy.com'),
    ('ps3','phone','+91 99999 99999'),
    ('ps4','zoomEnabled','true'),
    ('ps5','emailNotifications','true'),
    ('ps6','autoApprove','false'),
    ('ps7','maintenanceMode','false')`],
];

console.log("🔄 Pushing schema to Turso...\n");
let ok = 0, skipped = 0, failed = 0;

for (const [label, sql] of statements) {
  try {
    await client.execute(sql);
    console.log(`✅ ${label}`);
    ok++;
  } catch (err) {
    const msg = err.message ?? "";
    if (
      msg.includes("duplicate column") ||
      msg.includes("already exists") ||
      msg.includes("UNIQUE constraint failed")
    ) {
      console.log(`⏭  ${label} (already exists)`);
      skipped++;
    } else {
      console.error(`❌ ${label}: ${msg}`);
      failed++;
    }
  }
}

console.log(`\n${failed === 0 ? "🎉" : "⚠️"} Done — ${ok} executed, ${skipped} skipped, ${failed} failed.`);
client.close();
