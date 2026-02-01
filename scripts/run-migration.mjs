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

  // Contact info on landing (Get in touch) — from admin settings
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_email text`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_phone text`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_address text`;
  console.log("Migration applied: admin_settings contact_email, contact_phone, contact_address");

  // Contact form submissions as leads for admin
  await sql`
    CREATE TABLE IF NOT EXISTS contact_leads (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      email text not null,
      phone text not null,
      message text,
      created_at timestamptz not null default now()
    )
  `;
  console.log("Migration applied: contact_leads table");

  await sql`
    CREATE TABLE IF NOT EXISTS estimator_leads (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      email text not null,
      city text not null,
      pincode text not null,
      square_feet int not null,
      property_type text,
      rooms int,
      min_amount int,
      max_amount int,
      created_at timestamptz not null default now()
    )
  `;
  console.log("Migration applied: estimator_leads table");

  await sql`ALTER TABLE estimator_leads ADD COLUMN IF NOT EXISTS phone text`;
  console.log("Migration applied: estimator_leads.phone");

  await sql`ALTER TABLE city_pincode_rates ADD COLUMN IF NOT EXISTS rate_per_sq_yd numeric`;
  await sql`ALTER TABLE city_pincode_rates ADD COLUMN IF NOT EXISTS rate_per_sq_m numeric`;
  console.log("Migration applied: city_pincode_rates.rate_per_sq_yd, rate_per_sq_m");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
