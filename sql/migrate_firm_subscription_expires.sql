-- Designer yearly subscription: add expiry to firm_profiles
alter table firm_profiles
  add column if not exists subscription_expires_at timestamptz;

-- Backfill: set expiry to 1 year from now for firms who already paid (so they get a year from migration)
update firm_profiles fp
set subscription_expires_at = now() + interval '1 year'
where subscription_expires_at is null
  and exists (
    select 1 from payment_ledger pl
    where pl.firm_id = fp.user_id
      and pl.type = 'FIRM_REGISTRATION_FEE'
      and pl.status = 'RELEASED'
  );
