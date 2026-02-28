# Interior OS — Demo & Admin Login

## Admin login

Admins sign in at the same login page with the **admin** role:

- **URL:** `/login?role=admin`
- **Credentials:** Use the admin account created from environment variables on first run:
  - **Email:** value of `ADMIN_SEED_EMAIL` (e.g. `admin@interioros.com`)
  - **Password:** value of `ADMIN_SEED_PASSWORD` (set this in `.env.local` or Vercel)

There is no separate “admin sign up”. The first admin is created when the app starts and no admin user exists; credentials come from `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, and `ADMIN_SEED_NAME`.

## Demo credentials (real accounts in DB)

All demo users are **stored in the database** and created on first app load. Use these to log in:

| Role        | Email                     | Password  | Name / Studio      |
|-------------|---------------------------|-----------|--------------------|
| Customer    | `customer@interioros.com` | `Demo123!`| Aarav Sharma       |
| Designer    | `firm@interioros.com`     | `Demo123!`| Mira Kapoor / **Studio Nirmaan** |

### How to get a clean start

1. Apply the database schema (if not already done):
   ```bash
   npm run db:setup
   ```
2. Start the app once so admin and demo accounts are created:
   ```bash
   npm run dev
   ```
   Demo **customer** and **designer** (Studio Nirmaan) are inserted on first load and appear in Browse Designers.
3. Optional — remove demo projects/transactions for a clean slate:
   ```bash
   npm run seed:clean
   ```
   This deletes the demo customer's projects, milestones, and related payments. Registration and designer profiles are kept.
4. Optional — reset demo passwords or add extra sample data:
   ```bash
   npm run seed:demo
   ```


### What the demo includes

- **Customer:** Aarav Sharma — in DB with paid registration; can use dashboard, AI Cost Estimator, Browse Designers, project tracking, digital twin.
- **Studio Nirmaan:** Mira Kapoor — in DB with approved profile, full portfolio (3 works + PDF); designer login at `firm@interioros.com`.
- Sample projects (if not removed by `seed:clean`) for the demo customer with Studio Nirmaan.

Use these accounts to walk through the product (AI Cost Estimator, designers, project tracking, payments, digital twin) for demos.
