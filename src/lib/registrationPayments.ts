import { sql } from "@/lib/db";

const FIRM_REGISTRATION_AMOUNT = 3000;
const CUSTOMER_SUBSCRIPTION_AMOUNT = 1000;

/** True if this firm user has a RELEASED payment of type FIRM_REGISTRATION_FEE */
export async function hasFirmPaidRegistration(firmUserId: string): Promise<boolean> {
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
