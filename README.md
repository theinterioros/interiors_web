# Interior OS

Interior OS is a web-first platform for customers to discover verified interior designers, track milestones, simulate escrow payments, and manage a digital twin of their home documents. Built for India, optimized for a calm, premium experience.

## Tech Stack

- Next.js (App Router)
- Neon PostgreSQL + Prisma ORM
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

```
DATABASE_URL="postgresql://..."
ADMIN_SEED_EMAIL="admin@interioros.com"
ADMIN_SEED_PASSWORD="change-me"
ADMIN_SEED_NAME="Interior OS Admin"
APP_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="vercel_blob_token"
```

## Database

Run Prisma migrations once you have a Neon database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

The first admin user is seeded on app boot using `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` if no admin exists.

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

- Payments are mocked using an internal ledger. No payment providers are integrated.
- AI/AR functionality is represented as "Coming Soon" placeholders with TODO hooks.
