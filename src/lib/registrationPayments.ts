import { sql } from "@/lib/db";

/** Designer yearly subscription: ₹3,000/year */
const FIRM_REGISTRATION_AMOUNT = 3000;
const CUSTOMER_SUBSCRIPTION_AMOUNT = 1000;

/** True if this firm has an active yearly subscription (subscription_expires_at > now). Falls back to payment_ledger if no expiry set or column missing. */
export async function hasFirmPaidRegistration(firmUserId: string): Promise<boolean> {
  try {
    const [profile] = await sql<{ subscription_expires_at: Date | null }>`
      select subscription_expires_at from firm_profiles where user_id = ${firmUserId} limit 1
    `;
    if (profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()) {
      return true;
    }
    if (profile !== undefined) {
      return false;
    }
  } catch {
    // subscription_expires_at column may not exist before migration
  }
  const [row] = await sql<{ id: string }>`
    select id from payment_ledger
    where firm_id = ${firmUserId}
      and type = 'FIRM_REGISTRATION_FEE'
      and status = 'RELEASED'
    limit 1
  `;
  return !!row;
}

/** True if this customer user has a RELEASED payment of type CUSTOMER_REGISTRATION_FEE */
export async function hasCustomerPaidSubscription(customerUserId: string): Promise<boolean> {
  const [row] = await sql<{ id: string }>`
    select id from payment_ledger
    where customer_id = ${customerUserId}
      and type = 'CUSTOMER_REGISTRATION_FEE'
      and status = 'RELEASED'
    limit 1
  `;
  return !!row;
}

/** Number of project slots paid for: 1 per CUSTOMER_REGISTRATION_FEE + 1 per ADDITIONAL_PROJECT_FEE (RELEASED). */
export async function getCustomerProjectSlotsPaid(customerUserId: string): Promise<number> {
  const rows = await sql<{ count: string }>`
    select count(*)::text as count from payment_ledger
    where customer_id = ${customerUserId}
      and type in ('CUSTOMER_REGISTRATION_FEE', 'ADDITIONAL_PROJECT_FEE')
      and status = 'RELEASED'
  `;
  return parseInt(rows[0]?.count ?? "0", 10);
}

export const ADDITIONAL_PROJECT_FEE_AMOUNT = 1000;

export { FIRM_REGISTRATION_AMOUNT, CUSTOMER_SUBSCRIPTION_AMOUNT };
