# Interior OS — Demo & Admin Login

## Admin login

Admins sign in at the same login page with the **admin** role:

- **URL:** `/login?role=admin`
- **Credentials:** Use the admin account created from environment variables on first run:
  - **Email:** value of `ADMIN_SEED_EMAIL` (e.g. `admin@interioros.com`)
  - **Password:** value of `ADMIN_SEED_PASSWORD` (set this in `.env.local` or Vercel)

There is no separate “admin sign up”. The first admin is created when the app starts and no admin user exists; credentials come from `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, and `ADMIN_SEED_NAME`.

## Demo credentials (for investors)

After running the demo seed, you can log in as a **customer** or a **firm** with these accounts:

| Role     | Email                    | Password  |
|----------|--------------------------|-----------|
| Customer | `customer@interioros.com`| `Demo123!`|
| Firm     | `firm@interioros.com`    | `Demo123!`|

### How to create demo users

1. Apply the database schema (if not already done):
   ```bash
   npm run db:setup
   ```
2. Start the app once so the admin user is created (if using `ADMIN_SEED_*`).
3. Run the demo seed:
   ```bash
   npm run seed:demo
   ```

Demo accounts are created on first app load or by running the seed script. Demo accounts are also created automatically on first app load (registration/subscription marked paid). Run `npm run seed:demo` to add extra sample data or reset passwords to `Demo123!` if it’s missing.

### What the demo includes

- **Customer:** Aarav Sharma — can use the customer dashboard, view projects, milestones, digital twin.
- **Firm:** Mira Kapoor / Studio Nirmaan — approved firm profile with full bio, portfolio PDF, and 3 sample works; can use the firm dashboard, leads, and project management. (Email `firm@interiors.com` is also supported for backwards compatibility.)
- 2 sample projects (one ACTIVE, one REQUESTED) with milestones (Concept Design – SUBMITTED, Carpentry & finishing – PENDING). Running `npm run seed:demo` adds more (digital twin file, notifications).

Use these accounts to walk through the product (AI Cost Estimator, designers, project tracking, payments, digital twin) for demos.
