# Security & load testing — production readiness

## Security checklist

### Authentication & sessions
- [x] Session token stored in **httpOnly** cookie (not accessible to JS).
- [x] **sameSite: "lax"** to reduce CSRF; **secure: true** in production.
- [x] Session token is **hashed** in DB (SHA-256); only hash is stored.
- [x] Session expiry (30 days) enforced; expired sessions deleted and cookie cleared.
- [ ] **Recommendation:** Add **absolute session timeout** (e.g. re-auth after 24h of inactivity) if required by policy.
- [ ] **Recommendation:** Rate limit login and registration endpoints (see below).

### Authorization
- [x] Server actions use **requireAdmin()** / **requireRole()** / **requireFirmPaid()** etc.; no client-only checks for sensitive ops.
- [x] Protected routes redirect unauthenticated users to login; wrong role → `/unauthorized`.
- [ ] **Audit:** Ensure every server action that mutates data or reads sensitive data checks role/ownership.

### Headers (security)
- [x] **X-Frame-Options: DENY** — set in `src/proxy.ts` (Next.js 16 proxy).
- [x] **X-Content-Type-Options: nosniff**.
- [x] **Referrer-Policy: strict-origin-when-cross-origin**.
- [x] **Permissions-Policy** (camera, microphone, geolocation disabled).
- [x] **Strict-Transport-Security** (HSTS) in production only.
- [ ] **Content-Security-Policy** (CSP): add when ready (report-only first); allow Razorpay when integrated.

### Input & injection
- [x] **SQL:** Parameterized queries only (`sql\`...${var}\`` with Neon); no string concatenation for SQL.
- [x] **Passwords:** bcrypt (via app); not stored in plain text.
- [ ] **XSS:** User-generated content (names, comments, about) should be escaped when rendered (React escapes by default; avoid `dangerouslySetInnerHTML` with user input).
- [ ] **File uploads:** Validate MIME type and size; store in blob with safe names; do not execute.

### Secrets & environment
- [ ] **Never** commit `DATABASE_URL`, `RAZORPAY_KEY_SECRET`, session secrets, or SMTP credentials.
- [ ] Use different keys for test vs production (Razorpay, DB).
- [ ] Rotate secrets periodically; document rotation in runbook.

### Rate limiting (recommended)
- [ ] **Login:** Limit attempts per IP (e.g. 10/min) to reduce brute force.
- [ ] **Registration:** Limit per IP (e.g. 5/hour) to reduce abuse.
- [ ] **API routes:** Limit per IP or per user for `/api/*`.
- Options: Vercel rate limit (if available), Upstash Redis, or in-memory store for single-instance.

### Payment (when Razorpay is live)
- [ ] Verify **Razorpay webhook signature** with `RAZORPAY_WEBHOOK_SECRET`.
- [ ] **Idempotency:** Use `razorpay_payment_id` so the same event doesn’t double-credit.
- [ ] Do not trust client for amount; always use server-side amount from your DB when creating orders.

### Dependencies
- [ ] Run `npm audit` and fix high/critical; document or accept remaining. (Current: some transitive dev/build deps e.g. minimatch, ajv — run `npm audit` and `npm audit fix` where safe.)
- [ ] Keep Next.js and dependencies up to date for security patches.

---

## Load testing

### Goals
- Confirm critical paths handle concurrent users without errors or timeouts.
- Find bottlenecks (DB, serverless cold starts, N+1 queries).

### Critical paths
1. **Public:** Home, Browse designers, Designer profile, Login, Register.
2. **Customer:** Dashboard, Projects list, Project detail, Milestones, Payments.
3. **Designer:** Dashboard, Projects, Project detail, Profile, Payments.
4. **Admin:** Dashboard, Users, Payments, Designers, Projects.

### Tools
- **k6** (recommended): `k6 run scripts/load/k6-smoke.js`
- **Artillery:** `npx artillery run scripts/load/artillery.yml`
- Or simple **curl loop** / **Apache Bench** for a single endpoint.

### Example k6 script (smoke test)
- 10 VUs, 30s duration.
- Mix: GET `/`, GET `/designers`, GET `/login`, GET `/customer/dashboard` (with auth cookie if you have a test user).
- Pass criteria: 95% of requests < 3s, error rate < 1%.

### Where to put scripts
- `scripts/load/k6-smoke.js` — k6 script.
- `scripts/load/README.md` — how to run and interpret results.

### Production
- Prefer running load tests against **staging** or a **clone** of production DB, not production itself.
- Monitor DB connections and serverless concurrency during tests.

---

## Mobile responsiveness checklist

- [x] **Viewport:** `width=device-width`, `initialScale=1` in layout.
- [x] **Overflow:** `overflow-x-hidden` on body/html; tables in `.table-wrap` with `overflow-x-auto` and `min-width` on table.
- [x] **Touch targets:** `.btn`, `.input`, submit/button get `min-height: 44px` on mobile (see `globals.css`).
- [x] **Typography:** 14px base; headings use clamp/rem.
- [x] **Forms:** Inputs full-width; auth forms use `min-w-0 max-w-full` to avoid overflow.
- [x] **Tables:** All data tables use `.table-wrap` + `min-w-[520px]` or `640px` for horizontal scroll on small screens; negative margin on mobile for edge-to-edge scroll.
- [x] **Navigation:** Mobile bottom nav (h-16); drawer for “More”; no overlap.
- [x] **Modals/drawers:** Mobile drawer uses max-width and scroll; body overflow hidden when open.

**Pages updated:** Admin (users, users/[id], payments, projects, projects/[id]), Customer (dashboard, payments), Designer (projects, payments), Login, Register. Landing and public designer profile: rely on existing responsive layout and `.page` padding.
