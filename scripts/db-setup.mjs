import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { readFile } from "fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL (or DATABASE_URL_UNPOOLED) is required to run db setup.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  const schema = await readFile(new URL("../sql/schema.sql", import.meta.url), "utf8");
  const statements = schema
    .split(/;\s*\n/)
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }
  const [check] = await sql`select to_regclass('public.users') as users_table`;
  if (!check?.users_table) {
    console.warn("Schema applied, but users table not found. Check DB connection.");
  } else {
    console.log("Database schema applied.");
  }
}

main().catch((error) => {
  console.error("DB setup failed:", error);
  process.exit(1);
});
