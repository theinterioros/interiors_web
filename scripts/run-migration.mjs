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
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS estimator_prompt_custom text`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS visualization_prompt_custom text`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS llm_provider text NOT NULL DEFAULT 'OPENAI'`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS llm_model text`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS llm_image_model text`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS estimator_llm_provider text NOT NULL DEFAULT 'OPENAI'`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS estimator_llm_model text`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS visualization_llm_provider text NOT NULL DEFAULT 'OPENAI'`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS visualization_llm_model text`;
  await sql`ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS visualization_image_model text`;
  console.log("Migration applied: admin_settings contact_email, contact_phone, contact_address");

  await sql`
    CREATE TABLE IF NOT EXISTS ai_prompt_audit_logs (
      id uuid primary key default gen_random_uuid(),
      settings_id uuid not null references admin_settings(id) on delete cascade,
      admin_user_id uuid references users(id) on delete set null,
      prompt_key text not null,
      action text not null,
      previous_value text,
      new_value text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS ai_prompt_audit_settings_idx ON ai_prompt_audit_logs(settings_id, created_at desc)`;
  console.log("Migration applied: admin_settings prompt columns + ai_prompt_audit_logs");

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

  // Project lifecycle: LEAD status (customer creates -> LEAD; designer initiates -> ACTIVE)
  try {
    await sql`ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'LEAD'`;
    console.log("Migration applied: project_status LEAD");
  } catch (e) {
    if (!String(e).includes("already exists")) console.warn("project_status LEAD:", e);
  }
  // Additional project fee (₹1000 per extra project for customer)
  try {
    await sql`ALTER TYPE payment_type ADD VALUE IF NOT EXISTS 'ADDITIONAL_PROJECT_FEE'`;
    console.log("Migration applied: payment_type ADDITIONAL_PROJECT_FEE");
  } catch (e) {
    if (!String(e).includes("already exists")) console.warn("payment_type ADDITIONAL_PROJECT_FEE:", e);
  }

  // Designer: platform margin % and acceptance (hidden until accepted)
  await sql`ALTER TABLE firm_profiles ADD COLUMN IF NOT EXISTS platform_margin_pct numeric`;
  await sql`ALTER TABLE firm_profiles ADD COLUMN IF NOT EXISTS margin_accepted_at timestamptz`;
  await sql`ALTER TABLE firm_profiles ADD COLUMN IF NOT EXISTS google_review_links text`;
  console.log("Migration applied: firm_profiles platform_margin_pct, margin_accepted_at, google_review_links");

  // Payment ledger: platform margin amount when releasing to designer
  await sql`ALTER TABLE payment_ledger ADD COLUMN IF NOT EXISTS platform_margin_amount int`;
  console.log("Migration applied: payment_ledger.platform_margin_amount");

  // Designer yearly subscription: expiry on firm_profiles
  await sql`ALTER TABLE firm_profiles ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz`;
  try {
    await sql`
      UPDATE firm_profiles fp
      SET subscription_expires_at = now() + interval '1 year'
      WHERE subscription_expires_at IS NULL
        AND EXISTS (
          SELECT 1 FROM payment_ledger pl
          WHERE pl.firm_id = fp.user_id
            AND pl.type = 'FIRM_REGISTRATION_FEE'
            AND pl.status = 'RELEASED'
        )
    `;
  } catch (e) {
    if (!String(e).includes("subscription_expires_at")) console.warn("subscription_expires_at backfill:", e);
  }
  console.log("Migration applied: firm_profiles.subscription_expires_at");

  // Margin requests: designer submits margin %, admin approves/rejects with comment (full trail)
  await sql`
    CREATE TABLE IF NOT EXISTS margin_requests (
      id uuid primary key default gen_random_uuid(),
      profile_id uuid not null references firm_profiles(id) on delete cascade,
      requested_margin_pct numeric not null,
      status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
      admin_comment text,
      admin_set_margin_pct numeric,
      created_at timestamptz not null default now(),
      decided_at timestamptz,
      decided_by uuid references users(id) on delete set null
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS margin_requests_profile_idx ON margin_requests(profile_id)`;
  await sql`CREATE INDEX IF NOT EXISTS margin_requests_status_idx ON margin_requests(status)`;
  await sql`CREATE INDEX IF NOT EXISTS margin_requests_created_idx ON margin_requests(created_at desc)`;
  console.log("Migration applied: margin_requests table");

  // Portfolio works: optional table for grouping portfolio images
  await sql`
    CREATE TABLE IF NOT EXISTS firm_portfolio_works (
      id uuid primary key default gen_random_uuid(),
      profile_id uuid not null references firm_profiles(id) on delete cascade,
      title text not null,
      description text,
      display_order int not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS firm_portfolio_works_profile_idx ON firm_portfolio_works(profile_id)`;
  try {
    await sql`ALTER TABLE firm_portfolio_files ADD COLUMN IF NOT EXISTS work_id uuid references firm_portfolio_works(id) on delete set null`;
    await sql`CREATE INDEX IF NOT EXISTS firm_portfolio_files_work_idx ON firm_portfolio_files(work_id)`;
  } catch (e) {
    if (!String(e).includes("firm_portfolio_files")) console.warn("firm_portfolio_files.work_id:", e);
  }
  console.log("Migration applied: firm_portfolio_works (and work_id on firm_portfolio_files if present)");

  // Milestone trail: event log per milestone for timelines and audit
  await sql`
    CREATE TABLE IF NOT EXISTS milestone_trail (
      id uuid primary key default gen_random_uuid(),
      milestone_id uuid not null references milestones(id) on delete cascade,
      event text not null,
      actor_id uuid references users(id) on delete set null,
      message text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS milestone_trail_milestone_idx ON milestone_trail(milestone_id)`;
  await sql`CREATE INDEX IF NOT EXISTS milestone_trail_created_idx ON milestone_trail(created_at)`;
  console.log("Migration applied: milestone_trail table");

  // Razorpay: payment_ledger columns for order/payment/payout ids
  await sql`ALTER TABLE payment_ledger ADD COLUMN IF NOT EXISTS razorpay_order_id text`;
  await sql`ALTER TABLE payment_ledger ADD COLUMN IF NOT EXISTS razorpay_payment_id text`;
  await sql`ALTER TABLE payment_ledger ADD COLUMN IF NOT EXISTS razorpay_payout_id text`;
  console.log("Migration applied: payment_ledger razorpay_order_id, razorpay_payment_id, razorpay_payout_id");

  // Estimator leads: store full AI JSON payload
  await sql`ALTER TABLE estimator_leads ADD COLUMN IF NOT EXISTS estimate_payload jsonb`;
  console.log("Migration applied: estimator_leads.estimate_payload");

  // Deduplicate city_pincode_rates (keep newest row per settings + normalized city + pincode; exclude DEFAULT/*)
  await sql`
    delete from city_pincode_rates
    where id in (
      select id from (
        select id,
          row_number() over (
            partition by settings_id, lower(trim(city)), pincode
            order by created_at desc, id desc
          ) as rn
        from city_pincode_rates
        where not (city = 'DEFAULT' and pincode = '*')
      ) t
      where rn > 1
    )
  `;
  console.log("Migration applied: city_pincode_rates dedupe");

  await sql`
    create unique index if not exists city_pincode_rates_unique_override
    on city_pincode_rates (settings_id, (lower(trim(city))), pincode)
    where not (city = 'DEFAULT' and pincode = '*')
  `;
  console.log("Migration applied: city_pincode_rates_unique_override partial unique index");

  // Designer bank account for Razorpay payouts (one per designer)
  await sql`
    CREATE TABLE IF NOT EXISTS designer_bank_accounts (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      razorpay_contact_id text not null,
      razorpay_fund_account_id text not null,
      account_holder_name text not null,
      ifsc text not null,
      account_last4 text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique(user_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS designer_bank_accounts_user_idx ON designer_bank_accounts(user_id)`;
  console.log("Migration applied: designer_bank_accounts table");

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
