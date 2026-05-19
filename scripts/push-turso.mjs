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
    ('ps3','phone','+91 93114 83555'),
    ('ps4','zoomEnabled','true'),
    ('ps5','emailNotifications','true'),
    ('ps6','autoApprove','false'),
    ('ps7','maintenanceMode','false')`],

  // ── Resource table ────────────────────────────────────────────────────────
  ["Resource table", `CREATE TABLE IF NOT EXISTS "Resource" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "title"     TEXT NOT NULL,
    "type"      TEXT NOT NULL DEFAULT 'PDF',
    "subject"   TEXT NOT NULL,
    "size"      TEXT NOT NULL DEFAULT '',
    "icon"      TEXT NOT NULL DEFAULT '📄',
    "url"       TEXT NOT NULL DEFAULT '',
    "status"    TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],

  // ── VideoLesson table ─────────────────────────────────────────────────────
  ["VideoLesson table", `CREATE TABLE IF NOT EXISTS "VideoLesson" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "title"     TEXT NOT NULL,
    "subject"   TEXT NOT NULL,
    "duration"  TEXT NOT NULL DEFAULT '',
    "thumbnail" TEXT NOT NULL DEFAULT '📹',
    "videoUrl"  TEXT NOT NULL DEFAULT '',
    "views"     INTEGER NOT NULL DEFAULT 0,
    "status"    TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],

  // ── Seed study resources ──────────────────────────────────────────────────
  ["Seed resources", `INSERT OR IGNORE INTO "Resource" ("id","title","type","subject","size","icon","url","status") VALUES
    ('r1','Phonics Workbook — Level 1','PDF','Phonics','2.4 MB','📄','','active'),
    ('r2','Number Patterns Practice Sheet','PDF','Mathematics','1.1 MB','📄','','active'),
    ('r3','Grammar Rules Cheat Sheet','PDF','English Grammar','0.8 MB','📄','','active'),
    ('r4','Reading Comprehension Pack','PDF','English Grammar','3.2 MB','📄','','active'),
    ('r5','Science Experiments at Home','PDF','Science','1.7 MB','📄','','active'),
    ('r6','Multiplication Tables Poster','Image','Mathematics','0.5 MB','🖼️','','active'),
    ('r7','Sight Words Flash Cards','PDF','Phonics','1.2 MB','📄','','active'),
    ('r8','Creative Writing Prompts','PDF','English Grammar','0.9 MB','📄','','active')`],

  // ── RecordedSession table ─────────────────────────────────────────────────
  ["RecordedSession table", `CREATE TABLE IF NOT EXISTS "RecordedSession" (
    "id"              TEXT NOT NULL PRIMARY KEY,
    "title"           TEXT NOT NULL,
    "description"     TEXT NOT NULL DEFAULT '',
    "subject"         TEXT NOT NULL DEFAULT '',
    "studentName"     TEXT NOT NULL DEFAULT '',
    "tutorName"       TEXT NOT NULL DEFAULT '',
    "videoUrl"        TEXT NOT NULL,
    "duration"        TEXT NOT NULL DEFAULT '',
    "fileSize"        TEXT NOT NULL DEFAULT '',
    "uploadedBy"      TEXT NOT NULL,
    "uploadedByRole"  TEXT NOT NULL DEFAULT 'TUTOR',
    "visibility"      TEXT NOT NULL DEFAULT 'individual',
    "createdAt"       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],

  // ── TutorMaterial table ───────────────────────────────────────────────────
  ["TutorMaterial table", `CREATE TABLE IF NOT EXISTS "TutorMaterial" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "tutorName"   TEXT NOT NULL,
    "tutorEmail"  TEXT NOT NULL DEFAULT '',
    "studentName" TEXT NOT NULL DEFAULT '',
    "subject"     TEXT NOT NULL DEFAULT '',
    "title"       TEXT NOT NULL,
    "fileUrl"     TEXT NOT NULL,
    "fileType"    TEXT NOT NULL DEFAULT 'PDF',
    "fileSize"    TEXT NOT NULL DEFAULT '',
    "notes"       TEXT NOT NULL DEFAULT '',
    "visibility"  TEXT NOT NULL DEFAULT 'individual',
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],

  ["TutorMaterial.visibility column (ALTER)", `ALTER TABLE "TutorMaterial" ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'individual'`],

  // ── Seed video lessons ────────────────────────────────────────────────────
  ["Seed videos", `INSERT OR IGNORE INTO "VideoLesson" ("id","title","subject","duration","thumbnail","videoUrl","views","status") VALUES
    ('v1','Introduction to Letter Sounds','Phonics','12:30','🔤','',2100,'active'),
    ('v2','Blending CVC Words','Phonics','15:45','🔤','',1800,'active'),
    ('v3','Place Value Explained Simply','Mathematics','18:20','🔢','',3400,'active'),
    ('v4','Parts of Speech — Fun Way','English Grammar','14:10','📝','',2700,'active'),
    ('v5','Solar System for Kids','Science','20:00','🔬','',4100,'active'),
    ('v6','Creative Story Writing Tips','English Grammar','11:55','✍️','',1500,'active'),
    ('v7','Addition and Subtraction Tricks','Mathematics','16:40','🔢','',2200,'active'),
    ('v8','Rhyming Words and Word Families','Phonics','13:15','🔤','',1900,'active')`],
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
