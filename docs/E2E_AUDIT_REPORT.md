# End-to-End Functional Audit Report — The Interior OS

**Role:** Senior QA Engineer & Logic Auditor  
**Date:** Audit and fixes applied per test suites below.

---

## Test Suite 1: The Designer Visibility Gate

| Check | Requirement | Status | Notes |
|-------|-------------|--------|--------|
| 1 | Designer hidden from Customer "Verified Designers" list by default | **PASS** | New designers have `firm_profiles.status = 'PENDING'`. List query: `where status = 'APPROVED' and margin_accepted_at is not null`, so they never appear until both conditions are met. |
| 2 | If Admin sets margin but Designer has NOT clicked Accept, designer still hidden | **PASS** | `approveFirmAction` sets `margin_accepted_at = null` when approving. Visibility requires `margin_accepted_at is not null`, so designer remains hidden until they click ACCEPT. |
| Goal | `is_visible` only when `admin_status === 'approved'` AND `margin_accepted === true` | **PASS** | Implemented as: list and profile "Request Meetup" use `status = 'APPROVED' and margin_accepted_at is not null`. No separate `is_visible` column; same logic applied consistently. |

**Logic leak check:** A customer with a direct URL to `/designers/[id]` can see an unapproved/unaccepted firm profile, but "Request Meetup" is only rendered when `isVerifiedAndAccepted`. No bypass for creating a project with a hidden designer.

---

## Test Suite 2: The "Project Limit" Enforcement

| Check | Requirement | Status | Notes |
|-------|-------------|--------|--------|
| 1 | When customer clicks "Create New Project" a second time, system blocks and triggers ₹1000 payment modal | **PASS** | `RequestMeetupForm` calls `checkProjectLimitAction()` before submit. If `!limit.allowed` (i.e. `projectCount >= slotsPaid`), it opens `MockPaymentModal` for `ADDITIONAL_PROJECT_FEE`. |
| 2 | DB increments project "slot" only after successful mock payment | **PASS** | `payAdditionalProjectFeeAction()` inserts `ADDITIONAL_PROJECT_FEE` with status `RELEASED`. `getCustomerProjectSlotsPaid()` counts `CUSTOMER_REGISTRATION_FEE` + `ADDITIONAL_PROJECT_FEE` (RELEASED). Project creation happens only after payment in modal flow; `requestProjectAction` also re-checks `projectCount >= slotsPaid` server-side and returns `PROJECT_LIMIT_REACHED` if violated. |

**Logic leak check:** No bypass. Server-side enforcement in `requestProjectAction` prevents creating a second project without an extra paid slot; race conditions still result in one of the requests failing with `PROJECT_LIMIT_REACHED`.

---

## Test Suite 3: Project State Transitions (Lead → Active)

| Check | Requirement | Status | Notes |
|-------|-------------|--------|--------|
| 1 | Project status set to `LEAD` when customer requests meetup | **PASS** | `requestProjectAction` inserts project with `ProjectStatusValues.LEAD`. |
| 2 | Designer sees "Initiate Project" ONLY for leads | **PASS** | Dashboard and `/firm/leads` query `where p.status = 'LEAD'`. `initiateProjectAction` updates only rows with `status = LEAD` and `firm_id = user.id`. |
| 3 | After "Initiate", status → `ACTIVE` and "Create Milestone" unlocked | **PASS** | `initiateProjectAction` sets `status = ACTIVE`. **FIX APPLIED:** `createMilestoneAction` now requires `project.status === 'ACTIVE'` (throws otherwise). Firm project page shows "Create Milestone" form only when `project.status === 'ACTIVE'`; for `LEAD` it shows a notice to initiate first. |

**Logic leak check:** Designer cannot create milestones for LEAD projects: action rejects non-ACTIVE projects, and UI hides the form for LEAD.

---

## Test Suite 4: The Milestone & Virtual Escrow Loop

| Check | Requirement | Status | Notes |
|-------|-------------|--------|--------|
| 1 | Designer cannot "Release Funds" themselves | **PASS** | Only `releasePaymentAction` in admin actions; requires `requireAdmin()`. Designer/customer have no release action or button. |
| 2 | Customer "Approve & Pay" → status `HELD_IN_ESCROW` | **PASS** | Schema uses `HELD`; same meaning. `approveMilestoneAction` creates `payment_ledger` with `status: PaymentStatusValues.HELD`. |
| 3 | Admin Dashboard shows this milestone in "Pending Payouts" | **PASS** | Admin payments page lists all ledger entries; entries with `status === 'HELD'` show "Release to designer". HELD = pending payouts. |
| 4 | Admin "Release" calculates payout as `Total - (Total * Margin %)` | **PASS** | `releasePaymentAction` reads firm's `platform_margin_pct`, computes `platform_margin_amount = round(amount * pct / 100)`, stores it on ledger, and notifies designer of `amount - platform_margin_amount`. |

**Logic leak check:** Only admin can release; designer cannot release. Margin is computed from `firm_profiles.platform_margin_pct` at release time.

---

## Test Suite 5: Data Persistence & Digital Twin

| Check | Requirement | Status | Notes |
|-------|-------------|--------|--------|
| 1 | Every image uploaded to a Milestone appears in Customer "Digital Twin" vault | **PASS (FIX APPLIED)** | Digital Twin page now queries `milestone_images` joined to `milestones` and `projects` where `projects.customer_id = user.id`, and renders them in a "Milestone photos" section. No automatic copy to `digital_twin_files`; vault surfaces milestone images by query. |
| 2 | If project is `COMPLETED`, files still accessible to customer | **PASS** | Query does not filter by `projects.status`; all milestone images for the customer's projects (LEAD, ACTIVE, COMPLETED) are shown. Files remain downloadable via existing blob URLs. |

**Logic leak check:** Digital Twin is customer-scoped; only projects where `customer_id = user.id` are included.

---

## Test Suite 6: The Admin Financial Ledger

| Check | Requirement | Status | Notes |
|-------|-------------|--------|--------|
| 1 | Ledger correctly sums (Total Customers × 1000), (Additional Projects × 1000), (Total Milestone Commissions) | **PASS** | Subscription revenue: `sum(amount)` where `type in ('CUSTOMER_REGISTRATION_FEE', 'ADDITIONAL_PROJECT_FEE')` and `status = 'RELEASED'`. Commissions: `sum(platform_margin_amount)` where `status = 'RELEASED'` and `platform_margin_amount is not null`. **FIX APPLIED:** "Money in Escrow" card added: `sum(amount)` where `status = 'HELD'`. |
| 2 | Clear distinction between "Money in Escrow" (not released) and "Platform Revenue" (commissions collected) | **PASS (FIX APPLIED)** | Four cards: (1) Subscription revenue, (2) **Money in escrow** (HELD total), (3) Platform revenue (commissions), (4) Payout history. Labels clarify "Not yet released" vs "Commissions already collected". |

---

## Summary of Fixes Applied

1. **Create Milestone restricted to ACTIVE projects**  
   - `createMilestoneAction`: checks `project.status === 'ACTIVE'`; throws if not.  
   - Firm project page: "Create Milestone" form only when `project.status === 'ACTIVE'`; for LEAD, shows notice and no form.

2. **Digital Twin vault**  
   - Customer Digital Twin page now shows all milestone photos for the customer's projects (from `milestone_images` via milestones/projects) and all `digital_twin_files` for the customer. Accessible for all project statuses including COMPLETED.

3. **Admin Financial Ledger**  
   - "Money in Escrow" card added (sum of `amount` where `status = 'HELD'`).  
   - Copy updated to distinguish "Money in escrow" (pending) vs "Platform revenue (commissions)" (collected).

---

## Logic Leaks Addressed

- **Project limit:** Enforced server-side in `requestProjectAction`; no client-only check.
- **Designer visibility:** List and Request Meetup both require `APPROVED` and `margin_accepted_at`; no alternate path to request from a hidden designer.
- **Milestone creation:** Only for ACTIVE projects; action + UI aligned.
- **Release funds:** Only admin; designer/customer have no release action.

No remaining bypass identified for payments, project limit, or designer visibility.
