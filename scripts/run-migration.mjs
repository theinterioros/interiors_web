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

  // Trusted studios (landing "Trusted by Growing studios")
  await sql`
    CREATE TABLE IF NOT EXISTS trusted_studios (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      mark text not null,
      logo_bg text not null,
      sort_order int not null default 0,
      created_at timestamptz not null default now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS trusted_studios_sort_idx ON trusted_studios(sort_order)`;
  console.log("Migration applied: trusted_studios table");

  // Seed trusted_studios if empty
  const count = await sql`SELECT 1 FROM trusted_studios LIMIT 1`;
  if (count.length === 0) {
    const seed = [
      { name: "Studio Maple", mark: "SM", logo_bg: "bg-[var(--foreground)]", sort_order: 0 },
      { name: "UrbanWeave", mark: "UW", logo_bg: "bg-[var(--brand)]", sort_order: 1 },
      { name: "Aura Interiors", mark: "AI", logo_bg: "bg-[var(--accent-teal)]", sort_order: 2 },
      { name: "Frame & Form", mark: "FF", logo_bg: "bg-[var(--accent-amber)]", sort_order: 3 },
      { name: "Nexa Design", mark: "ND", logo_bg: "bg-[var(--foreground)]/80", sort_order: 4 },
      { name: "Spaces & Co", mark: "SC", logo_bg: "bg-[var(--brand)]", sort_order: 5 },
      { name: "Design Nest", mark: "DN", logo_bg: "bg-[var(--accent-emerald)]", sort_order: 6 },
    ];
    for (const s of seed) {
      await sql`
        INSERT INTO trusted_studios (id, name, mark, logo_bg, sort_order)
        VALUES (gen_random_uuid(), ${s.name}, ${s.mark}, ${s.logo_bg}, ${s.sort_order})
      `;
    }
    console.log("Seeded trusted_studios with default items");
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
