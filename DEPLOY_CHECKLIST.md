# Production deploy checklist

## Auth flows (tested and consistent)

### Login (`/login`)
- **Customer**: `?role=customer` → Sign in as Customer → redirects to `/customer/dashboard` (or `/customer/subscribe` if not paid).
- **Designer**: `?role=designer` or `?role=firm` → Sign in as Designer → redirects to `/designer/dashboard` or `/designer/register/pay` if subscription not paid.
- **Admin**: `?role=admin` → Sign in as Admin → redirects to `/admin`.
- **Redirect**: `?redirect=/designers` (or any safe path) is passed through and used after successful login.
- **Password reset success**: `?reset=1` shows green banner "Password reset successfully. Sign in with your new password."

### Register (`/register`)
- **Customer**: `?role=customer` → Create Customer account → redirects to `/customer/dashboard` (subscribe gate applied by layout).
- **Designer**: `?role=designer` or `?role=firm` → Create designer account (firm profile + optional portfolio) → redirects to `/designer/dashboard`.
- **Admin**: `?role=admin` → Shows "Admin accounts are invite-only" and link to `/login?role=admin`.

### Forgot password (`/forgot-password`)
- **Role**: `?role=customer`, `?role=designer`, or `?role=admin` — used for "Back to sign in" and post-reset redirect.
- After reset → redirects to `/login?role=<role>&reset=1` (designer uses `role=designer` for URL consistency).

### Cross-links
- Login "New here?" → Customer/Designer: `/register?role=customer` or `/register?role=designer`; Admin: "Customers: create account" → `/register?role=customer`.
- Register "Already have an account?" → `/login?role=customer` or `/login?role=designer`.
- Register footer: "Admin accounts are invite-only" → `/login?role=admin`.
- Forgot password "Back to sign in" → `/login?role=...` (designer uses `role=designer`).

## Pre-deploy

- [ ] **Environment**: Set `DATABASE_URL`, session secret, and any SMTP/OTP vars in production.
- [ ] **Build**: `npm run build` passes (TypeScript and Next.js).
- [ ] **Database**: Migrations applied; seed admin if required.
- [ ] **Auth**: Session cookie domain/secure flags correct for your domain.
- [ ] **Payments**: Registration/subscription flows use real or test payment config as intended.
- [ ] **Blob storage**: Vercel Blob (or other) configured for portfolio uploads and assets.

## Production DB cleanup (optional)

To keep **only** Mira Kapoor (designer), Aarav Sharma (customer), and all admins, and remove all other users and their data:

**Easiest:** Log in as admin → **Settings** (bottom of page) → click **Clean up database**. Confirm when prompted. No env vars or curl needed.

**CLI (local):** `npm run cleanup:production` with `DATABASE_URL` in `.env.local`. Same behavior. Use when you want to run against a local or remote DB from your machine.

## Post-deploy smoke test

1. **Login** as customer, designer, admin (or demo accounts).
2. **Register** new customer and new designer; confirm redirects and pay/subscribe gates.
3. **Forgot password** for each role; confirm email and redirect back to correct login tab.
4. **Protected routes**: Unauthenticated access redirects to `/login?role=...`; wrong role → `/unauthorized`.
