# Interior OS

Interior OS is a web-first platform for customers to discover verified interior designers, track milestones, simulate escrow payments, and manage a digital twin of their home documents. Built for India, optimized for a calm, premium experience.

## Tech Stack

- Next.js (App Router)
- Neon PostgreSQL (SQL client)
- Vercel Blob for file storage
- Tailwind CSS + Framer Motion
- Nodemailer (SMTP configurable by admin)

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env`:

See [`.env.example`](./.env.example) for all optional keys. Minimum:

```
DATABASE_URL="postgresql://..."
ADMIN_SEED_EMAIL="admin@interioros.com"
ADMIN_SEED_PASSWORD="change-me"
ADMIN_SEED_NAME="Interior OS Admin"
APP_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="vercel_blob_token"
```

**OpenAI (AI cost estimator):** set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`). If unset, estimates use the formula + admin pincode rates.

**Razorpay:** set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for real Checkout. If unset, pay flows use a short **mock** confirmation. For **webhooks**, add `RAZORPAY_WEBHOOK_SECRET` and point Razorpay to `https://<your-domain>/api/webhooks/razorpay` (events: `payment.captured`). For **designer payouts** when an admin releases escrow, enable RazorpayX and set `RAZORPAY_X_ACCOUNT_NUMBER` (from RazorpayX → Banking).

## Database

Apply the schema in `sql/schema.sql` to your Neon database (via Neon SQL editor or `psql`).

### One-command setup (Node)

```bash
npm run db:setup
```

Uses `DATABASE_URL_UNPOOLED` when available (recommended for schema setup).

### Optional: psql setup

```bash
npm run db:setup:psql
```

The first admin user is seeded on app boot using `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` if no admin exists.

**Admin login:** Go to `/login?role=admin` and sign in with `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`.

### Demo accounts

Demo **customer** and **firm** accounts are created automatically on first app load (after schema is applied). You can also run `npm run seed:demo` to create or reset them and add extra sample data.

| Role     | Email                     | Password  |
|----------|---------------------------|-----------|
| Customer | `customer@interioros.com` | `Demo123!`|
| Firm     | `firm@interioros.com`    | `Demo123!`|

Dummy data: 2 sample projects (one ACTIVE, one REQUESTED) linking the customer and firm, with milestones. See [DEMO.md](./DEMO.md) for details.

## Admin Settings

Configure the following in the admin dashboard:

- OTP enable/disable
- SMTP credentials
- Pricing fees and digital twin fee
- City & pincode rates
- Social + marketing links visibility

## Vercel Deployment

1. Create a Neon Postgres database and set `DATABASE_URL`.
2. Create a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN`.
3. Add `ADMIN_SEED_*` and `APP_URL` env vars in Vercel.
4. Deploy to Vercel.

## Notes

- **Payments:** `payment_ledger` tracks all charges. With Razorpay keys, Checkout creates orders and verifies signatures; without keys, the UI uses a mock pay step that still writes to the ledger (dev-friendly).
- **AI estimator:** Uses OpenAI when `OPENAI_API_KEY` is set; otherwise falls back to deterministic pricing from Admin → AI Estimator pricing.
- AI/AR room visualisation remains “Coming Soon” where marked in the product.
