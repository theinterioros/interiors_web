# Interior OS – Routes Reference

## Dashboard entry points (after sign-in)

| Role      | Base route   | Main dashboard URL        |
|-----------|--------------|---------------------------|
| **Admin** | `/admin`     | `/admin` (command center) |
| **Customer** | `/customer` | `/customer/dashboard`    |
| **Designer** | `/firm`    | `/firm/dashboard`         |

Designers use the **`/firm`** paths (not `/designer`); the app uses “firm” in the backend and “designer” in the UI.

---

## Login URLs (use these to land on the right sign-in form)

| Role      | Login URL                  |
|-----------|----------------------------|
| **Admin** | `/login?role=admin`        |
| **Customer** | `/login?role=customer`  |
| **Designer** | `/login?role=designer`  |

Visiting a protected area when not signed in (e.g. `/admin`) now redirects to the correct login URL with the right `role` (e.g. `/login?role=admin`).

---

## Key area routes

- **Admin:** `/admin`, `/admin/leads`, `/admin/users`, `/admin/designers`, `/admin/payments`, `/admin/projects`, `/admin/pricing`, `/admin/settings`, etc.
- **Customer:** `/customer/dashboard`, `/customer/payments`, `/customer/digital-twin`, `/customer/projects/[id]`, `/customer/subscribe`.
- **Designer (firm):** `/firm/dashboard`, `/firm/leads`, `/firm/profile`, `/firm/payments`, `/firm/projects/[id]`, `/firm/register/pay`.

Public: `/`, `/designers`, `/designers/[id]`, `/estimator`, `/login`, `/register`.
