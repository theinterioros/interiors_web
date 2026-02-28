# Interior OS – Test Report & Bug Fixes

## Scope of testing

- **Customer flow**: Registration, subscribe gate, browse designers, request project, dashboard, project detail, approve/reject milestones, payments, estimator, digital twin.
- **Designer flow**: Registration, pay gate, profile (details + portfolio), dashboard, leads, projects, milestones (add/submit/images), payments, renew.
- **Admin flow**: Dashboard, designers (approve/reject/nudge), projects, users, payments (hold/release), settings.
- **Public**: Landing, designers list, designer profile, estimator.
- **Auth**: Login (role, OTP, forgot password), register, redirect after login, pay gates.
- **UX**: Redirects, form errors, empty states, loading states, portfolio tab consistency.

---

## Bugs found and fixed

### 1. Designers listing still required `margin_accepted_at` (fixed)

- **Issue**: After removing the margin request feature, the public designers list (`/designers`) still filtered with `fp.margin_accepted_at is not null` and ordered by it. Approved designers without that set (e.g. approved before the change) did not appear.
- **Fix**: In `src/app/designers/page.tsx`, removed `margin_accepted_at` from the query. Listing now uses only `status = 'APPROVED'` and paid registration; order is `verified_at desc nulls last, created_at desc`.

### 2. Portfolio image actions landed on Details tab (fixed)

- **Issue**: After adding, deleting, or updating a portfolio image (upload/delete/caption), the app redirected to `/designer/profile` with no tab, so the user saw the Details tab instead of Portfolio.
- **Fix**: In `src/app/actions/designer.ts`, all profile redirects for portfolio actions now include `?tab=portfolio` (and keep success/error params): `uploadFirmPortfolioAction`, `deleteFirmPortfolioFileAction`, `updateFirmPortfolioFileAction`.

### 3. Login did not respect `?redirect=` (fixed)

- **Issue**: Links like `/login?redirect=/designers` did not send the user to `/designers` after login; they always went to the role default dashboard.
- **Fix**: Login page passes `redirectTo` from `searchParams.redirect` (only if it’s a safe path starting with `/` and not `//`) to `AuthLoginForm`. The form submits it as a hidden `redirect` field. `loginAction` reads it and, when valid, redirects there after pay gates instead of using `redirectByRole`.

---

## Already in good shape (no change)

- **Customer dashboard empty state**: “No projects yet” with “Start a project” CTA and “Browse designers” link when no filter.
- **Designer dashboard empty state**: “No leads yet. After a customer requests a meetup, leads appear here.” and similar for accepted/active.
- **Request project form**: Loading state (“Submitting…”), inline error display, project limit and extra-fee modal with `MockPaymentModal` (has processing state).
- **Approve milestone**: `MockPaymentModal` keeps processing state during the 2s mock delay and during `onConfirm()` (approve action).
- **Reject milestone**: Pending state and loading on submit; errors shown via `alert()`.
- **Register**: Client uses `router.push(result.redirect)` on success; pay/subscribe flows return redirect and client navigates.
- **Designer profile (public)**: Visibility already uses only `status === 'APPROVED'` (no `margin_accepted_at`).

---

## Recommendations for further testing

1. **E2E / manual**: Run through full customer journey (register → subscribe → browse → request project → approve milestone) and full designer journey (register → pay → profile + portfolio → lead → initiate → add milestone → submit → see in Submitted tab).
2. **Permissions**: As customer, try opening `/designer/projects/...` or `/admin`; as designer, try `/customer/dashboard`; expect redirect to login or unauthorized.
3. **Load**: Customer dashboard query uses correlated subqueries; designer dashboard uses three separate queries – consider combining if needed. Confirm DB indexes on `projects.customer_id`, `projects.firm_id`, `projects.status`, `milestones.project_id`, `firm_profiles.status`, `payment_ledger.firm_id`/`customer_id`.
4. **Mobile**: Test sidebar vs bottom nav, tables (horizontal scroll), modals and forms on small viewports.
5. **Errors**: Simulate server/DB errors and invalid IDs; ensure actions don’t expose stack traces and that forms show or handle errors.
6. **Accept/reject lead**: `respondProjectRequestAction` exists but is not used in the designer UI (only “Initiate” from LEAD). Confirm product intent: if designers should Accept/Reject before starting a project, wire that flow; otherwise treat as dead code and remove or document.

---

## File changes summary

| File | Change |
|------|--------|
| `src/app/designers/page.tsx` | Removed `margin_accepted_at` filter and order; list by `verified_at`, `created_at`. |
| `src/app/actions/designer.ts` | All portfolio-related redirects now use `?tab=portfolio` and preserve success/error params. |
| `src/app/(auth)/login/page.tsx` | Read `redirect` from searchParams; pass `redirectTo` to `AuthLoginForm` when safe. |
| `src/components/forms/AuthLoginForm.tsx` | Accept `redirectTo` prop; submit as hidden `redirect` when set. |
| `src/app/actions/auth.ts` | In `loginAction`, read `redirect` from formData and redirect there when safe after pay gates. |
