# Database migrations

## Quick: run all migrations (recommended)

From the project root (e.g. `interior-os/`), with `DATABASE_URL` or `DATABASE_URL_UNPOOLED` set in `.env.local`:

```bash
npm run db:migrate
```

This applies all migrations in one go (payment types, columns, `margin_requests`, `subscription_expires_at`, portfolio works, milestone trail, etc.). Safe to run multiple times; steps use `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` where possible.

---

## When to use what

| Situation | Command |
|-----------|--------|
| **New project / empty DB** | `npm run db:setup` — applies full `schema.sql` (drops and recreates tables). Then run `npm run db:migrate` to add any columns/tables added after schema was written. |
| **Existing DB (e.g. already using the app)** | `npm run db:migrate` — applies all incremental migrations, including `margin_requests`, `subscription_expires_at`, etc. |
| **Optional: run a single .sql file** | `psql "$DATABASE_URL" -f sql/migrate_margin_requests.sql` (or the file you need). Only needed if you prefer to run one migration at a time. |

---

## What `db:migrate` applies

- Payment type enum: `FIRM_REGISTRATION_FEE`, `ADDITIONAL_PROJECT_FEE`
- `firm_profiles`: `verified_at`, `platform_margin_pct`, `margin_accepted_at`, `google_review_links`, `subscription_expires_at`
- `payment_ledger`: `platform_margin_amount`
- `admin_settings`: contact fields
- `contact_leads`, `estimator_leads`, `trusted_studios`
- `city_pincode_rates`: `rate_per_sq_yd`, `rate_per_sq_m`
- **`margin_requests`** (designer margin flow)
- **`firm_portfolio_works`** and `firm_portfolio_files.work_id`
- **`milestone_trail`**
- Seed for `trusted_studios` if empty

---

## Environment

- Uses `DATABASE_URL_UNPOOLED` if set, otherwise `DATABASE_URL`.
- Loads `.env.local` then `.env` (via `dotenv` in the script).
