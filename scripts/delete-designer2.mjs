/**
 * Deletes the designer designer2@interioros.com (AS Interior / Arjun Sethi) from the DB.
 * Run once: node scripts/delete-designer2.mjs
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const EMAIL = "designer2@interioros.com";

async function main() {
  const [user] = await sql`select id from users where email = ${EMAIL} limit 1`;
  if (!user) {
    console.log("Designer", EMAIL, "not found. Nothing to delete.");
    return;
  }
  await sql`delete from users where id = ${user.id}`;
  console.log("Deleted designer", EMAIL, "(AS Interior) from the database.");
}

main().catch((err) => {
  console.error("Delete failed:", err);
  process.exit(1);
});
