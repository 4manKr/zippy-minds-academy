/**
 * Creates Admin and Tutor accounts in Turso.
 * Run with: node scripts/create-accounts.mjs
 *
 * After running, log in via /auth/login with these emails.
 * An OTP code will be sent (or printed to console in dev).
 */
import { createClient } from "@libsql/client";
import { randomUUID } from "crypto";
const createId = () => randomUUID();

const url   = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error("❌ Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN first.");
  process.exit(1);
}

const client = createClient({ url, authToken: token });

const accounts = [
  {
    id:    createId(),
    email: "amanchaurasiya5555@gmail.com",
    name:  "Aman Chaurasiya",
    role:  "ADMIN",
  },
  {
    id:    createId(),
    email: "zippymindsacademy@gmail.com",
    name:  "Zippy Minds Admin",
    role:  "ADMIN",
  },
  {
    id:    createId(),
    email: "teamtabindia@gmail.com",
    name:  "Team Tab India",
    role:  "TUTOR",
  },
  {
    id:    createId(),
    email: "ads.tabindia@gmail.com",
    name:  "Ads Tab India",
    role:  "TUTOR",
  },
];

console.log("🔄 Creating accounts...\n");

for (const acc of accounts) {
  try {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "User" (id, email, name, role, password, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [acc.id, acc.email, acc.name, acc.role],
    });
    console.log(`✅ ${acc.role}: ${acc.email}`);
  } catch (err) {
    console.error(`❌ Failed for ${acc.email}:`, err.message);
  }
}

console.log(`
🎉 Done! Login via /auth/login with these emails:

  👑 Admin : amanchaurasiya5555@gmail.com
  👑 Admin : zippymindsacademy@gmail.com
  📚 Tutor : teamtabindia@gmail.com
  📚 Tutor : ads.tabindia@gmail.com

An OTP code will be sent to each email on login.
Admins  → redirected to /dashboard/admin
Tutors  → redirected to /dashboard/tutor
`);

client.close();
