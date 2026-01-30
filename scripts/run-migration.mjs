import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL (or DATABASE_URL_UNPOOLED) is required to run migrations.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  // Add FIRM_REGISTRATION_FEE to payment_type enum if missing (safe to run multiple times)
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'payment_type' AND e.enumlabel = 'FIRM_REGISTRATION_FEE'
      ) THEN
        ALTER TYPE payment_type ADD VALUE 'FIRM_REGISTRATION_FEE';
      END IF;
    END
    $$
  `;
  console.log("Migration applied: payment_type enum (FIRM_REGISTRATION_FEE)");

  // Add verified_at to firm_profiles (safe to run multiple times)
  await sql`ALTER TABLE firm_profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz`;
  console.log("Migration applied: firm_profiles.verified_at");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
