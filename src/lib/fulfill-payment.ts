import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { notifyUser } from "@/lib/notifications";
import {
  MilestoneStatusValues,
  PaymentStatusValues,
  PaymentTypeValues,
  SubscriptionStatusValues,
} from "@/lib/types";

type LedgerRow = {
  id: string;
  type: string;
  status: string;
  amount: number;
  customer_id: string | null;
  firm_id: string | null;
  project_id: string | null;
  milestone_id: string | null;
  razorpay_payment_id: string | null;
};

/** Side effects after Razorpay payment is verified (ledger row already updated to HELD/RELEASED). Idempotent where possible. */
export async function runPostPaymentSideEffects(row: LedgerRow): Promise<void> {
  if (row.type === PaymentTypeValues.MILESTONE && row.milestone_id) {
    const [m] = await sql<{ status: string }>`
      select status from milestones where id = ${row.milestone_id} limit 1
    `;
    if (m?.status === MilestoneStatusValues.APPROVED) {
      return;
    }
    await sql`
      update milestones
      set status = ${MilestoneStatusValues.APPROVED}, updated_at = now()
      where id = ${row.milestone_id}
    `;
    await sql`
      insert into milestone_trail (id, milestone_id, event, actor_id, message, created_at)
      values (${crypto.randomUUID()}, ${row.milestone_id}, 'APPROVED', ${row.customer_id}, null, now())
    `;
    const [milestone] = await sql<{ title: string; project_id: string; firm_id: string }>`
      select m.title, m.project_id, p.firm_id
      from milestones m
      join projects p on p.id = m.project_id
      where m.id = ${row.milestone_id}
      limit 1
    `;
    if (milestone) {
      const [firmUser] = await sql<{ email: string }>`
        select email from users where id = ${milestone.firm_id} limit 1
      `;
      if (firmUser && row.customer_id) {
        await notifyUser({
          userId: milestone.firm_id,
          email: firmUser.email,
          type: "MILESTONE_APPROVED",
          title: "Milestone approved",
          message: `Milestone "${milestone.title}" has been approved.`,
        });
      }
    }
    revalidatePath("/admin");
    revalidatePath("/admin/payments");
    revalidatePath("/customer/payments");
    revalidatePath("/designer/payments");
    if (milestone?.project_id) {
      revalidatePath(`/customer/projects/${milestone.project_id}`);
      revalidatePath(`/designer/projects/${milestone.project_id}`);
    }
    return;
  }

  if (row.type === PaymentTypeValues.CUSTOMER_REGISTRATION_FEE && row.customer_id) {
    revalidatePath("/admin");
    revalidatePath("/admin/payments");
    revalidatePath("/customer/dashboard");
    revalidatePath("/customer/payments");
    return;
  }

  if (row.type === PaymentTypeValues.FIRM_REGISTRATION_FEE && row.firm_id) {
    try {
      await sql`
        update firm_profiles
        set subscription_expires_at = coalesce(
          case when subscription_expires_at > now() then subscription_expires_at + interval '1 year' else null end,
          now() + interval '1 year'
        )
        where user_id = ${row.firm_id}
      `;
    } catch {
      // column may not exist
    }
    revalidatePath("/admin");
    revalidatePath("/admin/payments");
    revalidatePath("/designer/dashboard");
    revalidatePath("/designer/payments");
    revalidatePath("/designer/profile");
    return;
  }

  if (row.type === PaymentTypeValues.ADDITIONAL_PROJECT_FEE && row.customer_id) {
    revalidatePath("/admin");
    revalidatePath("/admin/payments");
    revalidatePath("/customer/dashboard");
    return;
  }

  if (row.type === PaymentTypeValues.DIGITAL_TWIN_RENEWAL && row.customer_id) {
    const { getAdminSettings } = await import("@/lib/settings");
    const settings = await getAdminSettings();
    const amount = settings.digitalTwinYearlyFee ?? 1000;

    const [subscription] = await sql<{ id: string; expires_at: Date }>`
      select id, expires_at from digital_twin_subscriptions where customer_id = ${row.customer_id} limit 1
    `;
    const now = new Date();
    const currentExpiry = subscription ? new Date(subscription.expires_at) : null;
    const newExpiry = new Date(currentExpiry && currentExpiry > now ? currentExpiry : now);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    if (subscription) {
      await sql`
        update digital_twin_subscriptions
        set status = ${SubscriptionStatusValues.ACTIVE}, expires_at = ${newExpiry}, last_charged_at = ${now}
        where id = ${subscription.id}
      `;
    } else {
      await sql`
        insert into digital_twin_subscriptions (id, customer_id, status, started_at, expires_at, last_charged_at)
        values (${crypto.randomUUID()}, ${row.customer_id}, ${SubscriptionStatusValues.ACTIVE}, ${now}, ${newExpiry}, ${now})
      `;
    }
    revalidatePath("/customer/digital-twin");
    revalidatePath("/customer/dashboard");
    revalidatePath("/admin/payments");
  }
}
