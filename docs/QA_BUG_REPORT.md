# Interior OS — QA Bug Report

**Date:** January 29, 2025  
**Scope:** Full platform (landing, auth, customer, firm, admin, AI estimator, APIs)

---

## Critical

### 1. Dynamic route `params` not awaited (Next.js 15+)

**Where:** `src/app/designers/[id]/page.tsx`, `src/app/firm/projects/[id]/page.tsx`  
**Issue:** In Next.js 15+, `params` in dynamic routes is a **Promise**. Both pages use `params: { id: string }` and access `params.id` directly. This can yield `undefined` at runtime and cause "Firm not found" / "Project not found" even for valid IDs.  
**Fix:** Use `params: Promise<{ id: string }>` and `const { id } = await params` before queries.

---

### 2. Estimator API — invalid JSON returns 500

**Where:** `src/app/api/estimator/route.ts`  
**Issue:** `const body = await request.json()` is not wrapped in try/catch. Sending non-JSON or malformed body (e.g. empty body, invalid JSON) throws and returns 500 with no clear error.  
**Fix:** Wrap in try/catch and return `400` with message e.g. `"Invalid JSON body."`

---

### 3. Admin Settings — no revalidation after save

**Where:** `src/app/actions/admin.ts` — `updateSettingsAction`  
**Issue:** After saving settings, the action does not call `revalidatePath("/admin/settings")`. The admin may see stale values until manual refresh.  
**Fix:** Add `revalidatePath("/admin/settings")` before returning.

---

### 4. Request Project — no success feedback or redirect

**Where:** `src/app/actions/project.ts` — `requestProjectAction`  
**Issue:** After successfully creating a project, the action returns without redirect or success state. User stays on the firm profile with no visible confirmation.  
**Fix:** Either `redirect("/customer/dashboard")` (and optionally pass success via searchParams) or return a success state and show it in the form (e.g. toast or inline message).

---

### 5. Unpaid customer can request projects

**Where:** Designer profile page + `requestProjectAction`  
**Issue:** "Request Project" is shown for any logged-in customer. `requestProjectAction` does not check subscription. Unpaid customers can create projects.  
**Fix:** In `requestProjectAction`, ensure customer has paid (e.g. use `requireCustomerPaid()` or equivalent check) and return/redirect to subscribe if not; optionally hide "Request Project" on designer profile for unpaid customers.

---

## High

### 6. Firm registration — portfolio file never saved

**Where:** `AuthRegisterForm.tsx` (firm flow), `src/app/actions/auth.ts`  
**Issue:** Firm registration form has a "Portfolio attachment" file input (`name="portfolio"`), but `registerAction` does not read or upload the file. User can select a file but it is discarded.  
**Fix:** Either remove the file input and copy that says "You can upload after signup", or implement file upload (e.g. Vercel Blob) and store reference in `firm_portfolio_files` (or document storage) during registration.

---

### 7. OTP verify form — email not pre-filled

**Where:** `AuthLoginForm.tsx`  
**Issue:** After "Send OTP", the verify step shows a new form with an empty email field. User must re-enter the same email. Mistyping causes "Invalid or expired code" with no hint that the email might be wrong.  
**Fix:** Pre-fill the email in the verify form (e.g. from OTP request state or hidden input) so the user does not have to type it again.

---

### 8. Password strength not enforced

**Where:** `src/app/actions/auth.ts` — `registerAction`, and register form  
**Issue:** Only "Email and password are required" and "Passwords do not match" are checked. No minimum length or complexity. Very weak passwords (e.g. "1") can be stored.  
**Fix:** Add server-side rules (e.g. min length 8, optional complexity) and return a clear error; optionally add client-side validation and hints.

---

## Medium

### 9. Designer profile — "Raise issue" button does nothing

**Where:** `src/app/customer/projects/[id]/page.tsx`  
**Issue:** For milestones with status SUBMITTED, there is a "Raise issue" button with `type="button"` and no handler. Click has no effect.  
**Fix:** Wire to a dispute/milestone issue action or remove until implemented.

---

### 10. Designer profile — "Select Firm" button does nothing

**Where:** `src/app/designers/[id]/page.tsx`  
**Issue:** Next to "Request Project" there is a "Select Firm" button with `type="button"` and no handler.  
**Fix:** Implement selection flow (e.g. compare/shortlist) or remove.

---

### 11. Admin Settings — SMTP password shown in placeholder

**Where:** `src/app/admin/settings/page.tsx`  
**Issue:** SMTP password input uses `defaultValue={settings.smtpPass ?? ""}`. If stored, the password is sent to the client and shown in the input (or in HTML). Security risk.  
**Fix:** Do not send or display existing SMTP password; use placeholder like "Leave blank to keep current" and only update when user enters a new value.

---

### 12. Estimator — city from dropdown not validated against API

**Where:** `EstimatorForm.tsx`, CitySelect  
**Issue:** User can type any text in the city field (CitySelect is a combobox, not strict select). If they submit a city name that is not in the cities list or not in admin pricing, API returns 404. Copy could clarify "Choose from the list" or validate selection before submit.  
**Fix:** Optional: restrict to selected-from-list only (e.g. hidden input with selected value, or validate before submit).

---

## Low / UX

### 13. Contact form — no rate limiting

**Where:** `src/app/actions/contact.ts`  
**Issue:** No rate limiting on contact submissions. A bot or user could send many requests and fill inbox or hit SMTP limits.  
**Fix:** Add rate limit (e.g. by IP or session) and return 429 with message.

---

### 14. Login — no admin link in nav when logged out

**Where:** `HeaderNav.tsx`, login page  
**Issue:** When logged out, nav shows "Customer Sign In" and "Firm Sign In" but no "Admin" link. Admins must know to go to `/login?role=admin` or DEMO.md.  
**Fix:** Add "Admin" sign-in link (e.g. to `/login?role=admin`) in footer or nav for operators.

---

### 15. Customer dashboard — estimate panel always visible

**Where:** `src/app/customer/dashboard/page.tsx`, `DashboardEstimatePanel`  
**Issue:** Dashboard shows the estimate panel for all customers. If the product intent is "estimate only after details", consider showing it only when relevant (e.g. after a flag or step).  
**Fix:** Product decision; optionally gate or collapse estimate panel by user state.

---

## Summary

| Severity | Count |
|----------|--------|
| Critical | 5 |
| High     | 3 |
| Medium   | 4 |
| Low/UX   | 3 |
| **Total**| **15** |

**Recommended order:** Fix Critical 1–3 (params, API error handling, revalidatePath), then 4–5 (request project feedback and subscription gate). Then address High and Medium as capacity allows.
