# Next Steps: Testing Admin, Customer & Firm

Use this checklist after the landing page is done to test core functionality.

---

## 1. Prerequisites

**Environment & DB**

- [ ] `.env.local` has: `DATABASE_URL`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `ADMIN_SEED_NAME`, `APP_URL`, `BLOB_READ_WRITE_TOKEN`
- [ ] Schema applied: `npm run db:setup`
- [ ] App started at least once so the admin user is created (from `ADMIN_SEED_*`)
- [ ] Demo users created: `npm run seed:demo`

**Run the app**

```bash
npm run dev
```

Open **http://localhost:3000**.

---

## 2. Logins

| Role    | URL                  | Email                     | Password   |
|---------|----------------------|---------------------------|------------|
| **Admin**   | `/login?role=admin`   | Value of `ADMIN_SEED_EMAIL` (e.g. `admin@interioros.com`) | Value of `ADMIN_SEED_PASSWORD` |
| **Customer**| `/login?role=customer`| `customer@interioros.com` | `Demo123!` |
| **Firm**    | `/login?role=firm`    | `firm@interioros.com`     | `Demo123!` |

---

## 3. What to Test by Role

### Admin

1. **Login** → `/login?role=admin` → use `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` → should land on `/admin/dashboard`.
2. **Dashboard** → `/admin/dashboard` — overview loads.
3. **Settings** → `/admin/settings` — SMTP, OTP, fees, city/pincode rates, marketing links; save and confirm no errors.
4. **Pricing** → `/admin/pricing` — AI Cost Estimator rates; add/edit city & pincode rates if implemented.
5. **Users** → `/admin/users` — list of users (customer, firm, admin).
6. **Designers** → `/admin/designers` — list of firms; approve/reject if implemented.
7. **Projects / Payments** → `/admin/projects`, `/admin/payments` — pages load without errors.

### Customer

1. **Login** → `/login?role=customer` → `customer@interioros.com` / `Demo123!` → redirect to `/customer/dashboard`.
2. **Dashboard** → `/customer/dashboard` — projects or empty state.
3. **Projects** → `/customer/projects` and `/customer/projects/[id]` — list and detail; milestones if present.
4. **Digital Twin** → `/customer/digital-twin` — page loads; upload/view if implemented.
5. **Estimator** → `/estimator` (while logged in as customer) — run estimate; “Email my estimate” / sign-in flow if present.
6. **Designers** → `/designers` — browse firms; open a firm profile.

### Firm

1. **Login** → `/login?role=firm` → `firm@interioros.com` / `Demo123!` → redirect to `/firm/dashboard`.
2. **Dashboard** → `/firm/dashboard` — leads and projects.
3. **Leads** → `/firm/leads` — list of leads.
4. **Profile** → `/firm/profile` — edit firm details.
5. **Project detail** → `/firm/projects/[id]` — project and milestones.

---

## 4. Quick Sanity Checks

- **Role protection:** Logged in as customer, open `/admin/dashboard` → should redirect to `/unauthorized`. Same idea for firm → customer-only URLs.
- **Logged-out protection:** Not logged in, open `/customer/dashboard` → redirect to login.
- **Sign out:** Header “Sign out” clears session and returns to `/`.

---

## 5. Full Test Matrix

For a full regression pass, use **docs/TEST_CASES.md** (landing, auth, estimator, designers, admin, customer, firm, API).

---

## 6. If Demo Users Don’t Exist

```bash
npm run seed:demo
```

This creates/updates:

- Customer: `customer@interioros.com` / `Demo123!` (Aarav Sharma)
- Firm: `firm@interioros.com` / `Demo123!` (Mira Kapoor / Studio Nirmaan)
- Sample project linking them, milestone, and digital twin file

Re-run anytime to reset demo passwords to `Demo123!` or restore demo data.
