# Razorpay integration plan

## Goals

1. **Subscription & renewal payments** (designer yearly fee, customer subscription, renewals, additional project fee) → paid via Razorpay; money is **credited to the admin/platform Razorpay account**.
2. **Milestone payments** → Customer pays via Razorpay; funds are **held** until admin approves; on **Release**, amount (minus platform margin) is **credited to the designer’s bank account** via Razorpay Payouts.
3. **Designer bank account** → Designer must add bank details in profile; they can **only request milestone payment** (submit milestone for customer approval) if bank details are present; admin can **only release** to designer if bank details are present.

---

## Current state (no gateway)

- **Subscriptions / renewals:** Actions (`payFirmRegistrationAction`, `renewFirmSubscriptionAction`, `payCustomerSubscriptionAction`, etc.) insert into `payment_ledger` with `RELEASED` and update `firm_profiles.subscription_expires_at` or customer subscription — **no real payment**.
- **Milestones:** Customer “approves” milestone → we insert `payment_ledger` with `HELD`. Admin “releases” → we update to `RELEASED`, set `platform_margin_amount`, notify — **no real money movement**.
- **payment_ledger:** No Razorpay IDs; no link to gateway.

---

## Phase 1: Config, DB, and designer bank account

### 1.1 Configuration

- **Env vars:**  
  - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (test/live).  
  - `RAZORPAY_WEBHOOK_SECRET` (optional, for verifying webhooks).  
- **Razorpay Node SDK** (or `fetch` to Razorpay API) in a small server-side module (e.g. `lib/razorpay.ts`).

### 1.2 Database

- **payment_ledger** (new columns):
  - `razorpay_order_id` (nullable text)
  - `razorpay_payment_id` (nullable text)
  - `razorpay_payout_id` (nullable text) — for milestone payouts to designer
- **Designer bank / Razorpay payout identity:**
  - Option A: New table `designer_bank_accounts` (or `designer_fund_accounts`):  
    `user_id`, `razorpay_contact_id`, `razorpay_fund_account_id`, `account_holder_name`, `ifsc`, `account_number` (masked for display), `created_at`, `updated_at`.  
  - Option B: Add columns on `firm_profiles`:  
    `razorpay_contact_id`, `razorpay_fund_account_id`, `bank_account_holder_name`, `bank_ifsc`, `bank_account_last4` (or masked).  
  - Recommendation: **New table** `designer_bank_accounts` (one active per designer) so we don’t clutter `firm_profiles` and can store Razorpay IDs and minimal display-only bank info.

Migration: add `payment_ledger` columns; create `designer_bank_accounts` (or chosen schema).

### 1.3 Designer profile: bank account

- **Designer profile page** (e.g. new tab or section “Payout details” / “Bank account”):
  - Form: account holder name, account number, IFSC (and optionally confirm account number).
  - On submit:
    - Call Razorpay: create **Contact** (name, etc.), then create **Fund Account** (bank) for that contact.
    - Store `razorpay_contact_id`, `razorpay_fund_account_id` and masked account info in `designer_bank_accounts` (one row per designer; update if they change bank).
  - Show current bank details (masked) and “Edit” if already set.
- **Guard:** Before designer can **submit a milestone** (request customer approval), check that they have a linked bank account (row in `designer_bank_accounts`). If not, show error / CTA to add bank details in profile.

---

## Phase 2: Subscription and renewal payments (money to admin)

- **Designer subscription (register + renew):**
  - Replace current “mock” flow with: create Razorpay **Order** (amount in paise, receipt = ledger id or similar), redirect to **Razorpay Checkout** (or return URL to your “success” page).
  - On **success** (return URL + optional webhook): verify signature, insert/update `payment_ledger` (status `RELEASED`), set `razorpay_order_id` / `razorpay_payment_id`, update `firm_profiles.subscription_expires_at`.
- **Customer subscription (and additional project fee):**
  - Same pattern: create Order → Checkout → on success, insert `payment_ledger` (RELEASED) and optional customer subscription state.
- **Renewals:** Same as subscription (create Order, Checkout, on success extend expiry and insert ledger row).
- All these flows **do not** use “hold”; money goes straight to your Razorpay account (admin).

---

## Phase 3: Milestone payments (customer pays → hold → release to designer)

### 3.1 Customer pays (Razorpay)

- When customer clicks **“Approve” (and pay)** for a milestone:
  - Create Razorpay **Order** for milestone amount (in paise).
  - Redirect customer to **Razorpay Checkout** (with return URL to project/milestones page and failure URL).
  - On **success** (return + webhook):
    - Verify payment.
    - Insert `payment_ledger` with status **HELD**, `razorpay_order_id`, `razorpay_payment_id`, link to `project_id` / `milestone_id`, `customer_id`, `firm_id`.
    - Update milestone status to APPROVED (and any trail/notifications as today).
- No money is sent to the designer yet; it sits in your Razorpay account.

### 3.2 Admin releases to designer (Razorpay Payout)

- When admin clicks **“Release to designer”**:
  - Ensure designer has a **bank account** (row in `designer_bank_accounts` with `razorpay_fund_account_id`). If not, disable release or show error.
  - Compute designer amount: `milestone amount - platform_margin_amount`.
  - Call Razorpay **Payout / Transfer** API to send that amount to the designer’s **fund account** (using stored `razorpay_fund_account_id`).
  - On success:
    - Update `payment_ledger`: status = `RELEASED`, set `platform_margin_amount`, optionally `razorpay_payout_id`.
    - Notify designer and customer (as today).
  - On failure (e.g. invalid account): show error, leave status HELD, allow retry or support flow.

---

## Phase 4: Webhooks and robustness

- **Razorpay webhook** (e.g. `POST /api/webhooks/razorpay`):
  - Verify signature using `RAZORPAY_WEBHOOK_SECRET`.
  - Handle `payment.captured`: idempotently update `payment_ledger` (and subscription/milestone state) so that even if return URL is missed, DB stays correct.
- **Idempotency:** Use `razorpay_payment_id` (and optionally order_id) so the same webhook/return doesn’t create duplicate ledger rows or double-extend subscription.

---

## Summary of flows

| Flow | Who pays | Where money goes | When |
|------|-----------|-------------------|------|
| Designer subscription / renewal | Designer | Admin (Razorpay account) | Checkout success |
| Customer subscription / add-project fee | Customer | Admin (Razorpay account) | Checkout success |
| Milestone | Customer | First to platform (Razorpay); after admin “Release”, (amount − margin) to designer bank | Pay at approve; release on admin action |

---

## Implementation order (recommended)

1. **Phase 1:** Config, DB migration, designer bank account UI + API (Razorpay Contact/Fund Account), guard on “submit milestone” (bank details required).
2. **Phase 2:** Replace subscription/renewal flows with Razorpay Orders + Checkout; success handler and optional webhook for `payment.captured`.
3. **Phase 3:** Milestone: “Approve & pay” with Razorpay Checkout; on success create HELD ledger row; admin “Release” triggers Razorpay Payout to designer’s fund account.
4. **Phase 4:** Webhook endpoint, signature verification, idempotent handling.

---

## Notes

- **Razorpay test vs live:** Use test keys and test mode until you’re satisfied; then switch to live keys and live mode.
- **Payout eligibility:** Razorpay Payouts have eligibility rules (KYC, etc.); document that designers may need to complete any required steps for payouts to work.
- **Refunds / failures:** Plan for payment failure or refund (e.g. leave ledger as PENDING or add CANCELLED; do not extend subscription until payment is captured).

If you approve this plan, next step is implementing Phase 1 (config, DB, designer bank account and milestone-submit guard).
