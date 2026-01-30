-- Run this on existing DBs to add firm registration payment and verified badge.
-- New installs use schema.sql which already includes these.

-- Add new payment type for one-time firm registration (₹3000)
-- (Skip if already applied; PostgreSQL has no IF NOT EXISTS for enum values.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'FIRM_REGISTRATION_FEE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_type')) THEN
    ALTER TYPE payment_type ADD VALUE 'FIRM_REGISTRATION_FEE';
  END IF;
END
$$;

-- Allow verified badge on approved firms
ALTER TABLE firm_profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;
