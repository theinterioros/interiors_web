# Interior OS — Test Cases & QA Flows

Manual test cases for all user flows. Run these after changes to catch regressions.

---

## 1. Landing & Public Pages

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| L1 | Home page loads | Open `/` | Hero, sections (How it works, AI Cost Estimator, Verified Firms, etc.), footer with visible text (dark on white), no console errors. |
| L2 | Footer content visible | Scroll to footer on `/` | All footer text (Interior OS, Links, Social, copyright) is readable (not white on white). |
| L3 | Nav: How it works | Click "How it works" in header | Scrolls to `#how-it-works`. |
| L4 | Nav: Firms | Click "Firms" | Goes to `/designers`; list of firms or empty state (no login required). |
| L5 | Nav: AI Cost Estimator | Click "AI Cost Estimator" | Goes to `/estimator`. |
| L6 | Nav: Digital Twin | Click "Digital Twin" | Goes to `/digital-twin`. |
| L7 | CTA: Get AI cost estimate | Click "Get AI cost estimate" in hero | Goes to `/estimator`. |
| L8 | CTA: Browse verified firms | Click "Browse verified firms" | Goes to `/designers` (public, no redirect to login). |
| L9 | Contact form submit | Fill name, email, phone, message; submit "Request a call" | Success message or email sent; or clear error if SMTP not configured. |
| L10 | Footer links | Click each link in footer (AI Cost Estimator, Firms, etc.) | Correct pages open. |

---

## 2. Auth: Login

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| A1 | Customer login page | Open `/login` or `/login?role=customer` | Customer-themed layout; form (email/identifier + password). |
| A2 | Firm login page | Open `/login?role=firm` | Firm-themed layout; same form. |
| A3 | Admin login page | Open `/login?role=admin` | Admin-themed layout; form. |
| A4 | Login with invalid credentials | Submit wrong email/password | Error: "Invalid credentials." |
| A5 | Login with valid customer | Use demo customer credentials | Redirect to `/customer/dashboard`. |
| A6 | Login with valid firm | Use demo firm credentials | Redirect to `/firm/dashboard`. |
| A7 | Login with valid admin | Use admin seed credentials | Redirect to `/admin/dashboard`. |
| A8 | Sign out | Click "Sign out" in header | Session cleared; redirect to `/`. |

---

## 3. Auth: Register

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| B1 | Customer register | Open `/register` or `/register?role=customer` | Customer sign-up form; name, phone, email, password. |
| B2 | Firm register | Open `/register?role=firm` | Firm sign-up form with firm details (firm name, city, pincode, etc.). |
| B3 | Register with existing email | Submit email already in DB | Error: "Email is already registered." |
| B4 | Register admin via URL | Open `/register?role=admin` | Message: admins are invite-only; link to admin sign in. No role=ADMIN in form. |
| B5 | Successful customer registration | Fill valid customer form; submit | Redirect to `/customer/dashboard`. |
| B6 | Successful firm registration | Fill valid firm form; submit | Redirect to `/firm/dashboard`. |

---

## 4. AI Cost Estimator

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| E1 | Estimator page load | Open `/estimator` | Form: city, pincode, property type, configuration, carpet area, unit. |
| E2 | Submit with missing fields | Leave city or pincode empty; submit | Client-side validation (required) or API returns 400 "Missing required fields." |
| E3 | Submit with invalid city/pincode | Enter city+pincode not in admin pricing | API returns 404; UI shows error "No pricing available for the selected city and pincode." |
| E4 | Submit with valid data | Enter city, pincode, area (e.g. 1200), property type, config; submit | Result panel shows range (₹min - ₹max), breakdown, disclaimer. |
| E5 | Email estimate (logged out) | After estimate, click "Email my estimate" | Navigates to login (or shows "Sign in to email estimate"); no crash. |
| E6 | Copy/UX of estimate | After result | "Email my estimate" is a link/button with clear intent (e.g. Sign in to email). |

---

## 5. Designers (Firms) — Public

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| D1 | Designers list without login | Open `/designers` (logged out) | Page loads; shows approved firms or "No approved firms yet." No redirect to login. |
| D2 | Designers list with login | Open `/designers` (logged in as customer) | Same list. |
| D3 | Firm detail | Click a firm card "View profile" | Goes to `/designers/[id]`; profile or 404. |

---

## 6. Role-Based Access

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| R1 | Customer visits admin dashboard | Log in as customer; open `/admin/dashboard` | Redirect to `/unauthorized`. |
| R2 | Firm visits customer dashboard | Log in as firm; open `/customer/dashboard` | Redirect to `/unauthorized`. |
| R3 | Unauthenticated visits customer dashboard | Logged out; open `/customer/dashboard` | Redirect to `/login`. |
| R4 | Unauthorized page | Open `/unauthorized` | Message "Access restricted" and "Return to home" link. |

---

## 7. Admin

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| M1 | Admin dashboard | Log in as admin; open `/admin/dashboard` | Dashboard loads. |
| M2 | Admin settings | Open `/admin/settings` | SMTP, OTP, fees, links; save works. |
| M3 | Admin pricing | Open `/admin/pricing` | Copy references "AI Cost Estimator"; rates CRUD if implemented. |
| M4 | Admin users | Open `/admin/users` | List of users. |
| M5 | Admin designers | Open `/admin/designers` | List of firms; approve/reject if implemented. |
| M6 | Admin projects / payments | Open `/admin/projects`, `/admin/payments` | Pages load without error. |

---

## 8. Customer Dashboard & Flows

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| C1 | Customer dashboard | Log in as customer; open `/customer/dashboard` | Dashboard with projects or empty state. |
| C2 | Customer projects | Open `/customer/projects/[id]` | Project detail; milestones if applicable. |
| C3 | Customer digital twin | Open `/customer/digital-twin` | Digital twin page. |
| C4 | Customer milestones / payments | Open `/customer/milestones`, `/customer/payments` | Pages load. |

---

## 9. Firm Dashboard & Flows

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| F1 | Firm dashboard | Log in as firm; open `/firm/dashboard` | Dashboard with leads/projects. |
| F2 | Firm leads | Open `/firm/leads` | Leads list. |
| F3 | Firm profile | Open `/firm/profile` | Profile edit. |
| F4 | Firm project detail | Open `/firm/projects/[id]` | Project detail. |

---

## 10. API & Edge Cases

| ID | Flow | Steps | Expected |
|----|------|--------|----------|
| API1 | POST /api/estimator — missing fields | POST `{}` or missing city/pincode/squareFeet | 400, body `{ error: "Missing required fields." }`. |
| API2 | POST /api/estimator — squareFeet 0 | Valid city/pincode, squareFeet: 0 | 400 or 404 (no pricing / invalid). |
| API3 | POST /api/estimator — valid body | Valid city, pincode, squareFeet, propertyType, rooms | 200, JSON with min, max, breakdown, disclaimer. |

---

## Bugs Fixed (QA Session)

1. **Footer invisible** — Footer text used CSS variables that did not apply in context; replaced with explicit hex colors so content is visible on white.
2. **Contact form no action** — Form had no `action` or `name` attributes; added server action and wired form to send email to admin (or show error if SMTP not configured).
3. **Designers required login** — Landing CTA "Browse verified firms" sent users to `/designers` which required login; made designers page public so browsing works without account.
4. **Estimator "Email my estimate" did nothing** — Button had no handler; changed to "Sign in to email estimate" linking to login so intent is clear and no dead action.
5. **Estimator copy** — All user-facing "estimator" replaced with "AI Cost Estimator" (per product request).

---

## How to Run

- **Manual:** Go through each flow in a browser; check expected column.
- **Build:** `npm run build` — must pass.
- **Lint:** `npm run lint` — fix any reported issues.
