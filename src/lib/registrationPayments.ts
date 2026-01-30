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

export { FIRM_REGISTRATION_AMOUNT, CUSTOMER_SUBSCRIPTION_AMOUNT };
