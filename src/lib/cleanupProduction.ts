/**
 * Production DB cleanup: keep only Mira Kapoor (designer), Aarav Sharma (customer), and all admins.
 * Shared logic for CLI script and POST /api/admin/cleanup-production.
 */
import { sql } from "@/lib/db";

const DEMO_CUSTOMER_EMAIL = "customer@interioros.com";
const DEMO_FIRM_EMAIL = "firm@interioros.com";
const DEMO_CUSTOMER_NAME = "Aarav Sharma";
const DEMO_FIRM_NAME = "Mira Kapoor";

export type CleanupResult = {
  ok: boolean;
  kept: number;
  removed: number;
  message: string;
};

/** Delete one user and all related data (payment_ledger, projects, notifications, etc.). Use from admin only. */
export async function deleteUserAndRelatedData(userId: string): Promise<void> {
  await sql`delete from payment_ledger where customer_id = ${userId} or firm_id = ${userId}`;
  try {
    await sql`delete from digital_twin_files where customer_id = ${userId} or uploaded_by = ${userId}`;
  } catch {}
  try {
    await sql`delete from digital_twin_subscriptions where customer_id = ${userId}`;
  } catch {}
  try {
    await sql`delete from notifications where user_id = ${userId}`;
  } catch {}
  try {
    await sql`delete from milestone_comments where author_id = ${userId}`;
  } catch {}
  try {
    await sql`update milestone_trail set actor_id = null where actor_id = ${userId}`;
  } catch {}
  try {
    await sql`update margin_requests set decided_by = null where decided_by = ${userId}`;
  } catch {}
  await sql`delete from projects where customer_id = ${userId}`;
  await sql`update projects set firm_id = null where firm_id = ${userId}`;
  await sql`delete from firm_profiles where user_id = ${userId}`;
  await sql`delete from sessions where user_id = ${userId}`;
  await sql`delete from users where id = ${userId}`;
}

export async function runCleanupProduction(): Promise<CleanupResult> {
  const allUsers = (await sql`
    select id, email, name, role from users
  `) as { id: string; email: string | null; name: string | null; role: string }[];

  const keepIds = new Set<string>();
  let keptDesigner = false;
  let keptCustomer = false;

  for (const u of allUsers) {
    if (u.role === "ADMIN") keepIds.add(u.id);
  }
  for (const u of allUsers) {
    if (u.role === "FIRM" && (u.email === DEMO_FIRM_EMAIL || u.name === DEMO_FIRM_NAME) && !keptDesigner) {
      keepIds.add(u.id);
      keptDesigner = true;
    }
  }
  for (const u of allUsers) {
    if (u.role === "CUSTOMER" && (u.email === DEMO_CUSTOMER_EMAIL || u.name === DEMO_CUSTOMER_NAME) && !keptCustomer) {
      keepIds.add(u.id);
      keptCustomer = true;
    }
  }

  // Keep any customer you have notified (designers: only Mira Kapoor above)
  const notifiedNonDesigners = (await sql`
    select distinct n.user_id from notifications n
    join users u on u.id = n.user_id
    where u.role != 'FIRM'
  `) as { user_id: string }[];
  for (const row of notifiedNonDesigners) {
    keepIds.add(row.user_id);
  }

  const toRemove = allUsers.filter((u) => !keepIds.has(u.id)).map((u) => u.id);

  if (toRemove.length === 0) {
    return {
      ok: true,
      kept: keepIds.size,
      removed: 0,
      message: "No extra users to remove. Kept: Mira Kapoor (only designer), Aarav Sharma, all admins, and any notified customer.",
    };
  }

  const ids = [...toRemove];

  for (const id of ids) {
    await sql`delete from payment_ledger where customer_id = ${id} or firm_id = ${id}`;
  }
  try {
    for (const id of ids) {
      await sql`delete from digital_twin_files where customer_id = ${id} or uploaded_by = ${id}`;
    }
  } catch {}
  try {
    for (const id of ids) {
      await sql`delete from digital_twin_subscriptions where customer_id = ${id}`;
    }
  } catch {}
  try {
    for (const id of ids) {
      await sql`delete from notifications where user_id = ${id}`;
    }
  } catch {}
  try {
    for (const id of ids) {
      await sql`delete from milestone_comments where author_id = ${id}`;
    }
  } catch {}
  try {
    for (const id of ids) {
      await sql`update milestone_trail set actor_id = null where actor_id = ${id}`;
    }
  } catch {}
  try {
    for (const id of ids) {
      await sql`update margin_requests set decided_by = null where decided_by = ${id}`;
    }
  } catch {}

  for (const id of ids) {
    await sql`delete from projects where customer_id = ${id}`;
  }
  for (const id of ids) {
    await sql`update projects set firm_id = null where firm_id = ${id}`;
  }
  for (const id of ids) {
    await sql`delete from firm_profiles where user_id = ${id}`;
  }
  for (const id of ids) {
    await sql`delete from sessions where user_id = ${id}`;
  }
  for (const id of ids) {
    await sql`delete from users where id = ${id}`;
  }

  // Orphan cleanup: only relevant data in every table (no dangling refs)
  try {
    await sql`
      delete from payment_ledger
      where (customer_id is not null and not exists (select 1 from users u where u.id = payment_ledger.customer_id))
         or (firm_id is not null and not exists (select 1 from users u where u.id = payment_ledger.firm_id))
    `;
    await sql`
      delete from payment_ledger
      where project_id is not null and not exists (select 1 from projects p where p.id = payment_ledger.project_id)
    `;
    await sql`
      delete from payment_ledger
      where milestone_id is not null and not exists (select 1 from milestones m where m.id = payment_ledger.milestone_id)
    `;
    await sql`
      delete from payment_ledger
      where type in ('MILESTONE', 'ADVANCE', 'ADDITIONAL_PROJECT_FEE') and project_id is null
    `;
  } catch {}

  try {
    await sql`
      delete from notifications
      where not exists (select 1 from users u where u.id = notifications.user_id)
    `;
  } catch {}

  try {
    await sql`
      delete from digital_twin_files
      where not exists (select 1 from users u where u.id = digital_twin_files.customer_id)
         or not exists (select 1 from users u where u.id = digital_twin_files.uploaded_by)
         or (project_id is not null and not exists (select 1 from projects p where p.id = digital_twin_files.project_id))
    `;
  } catch {}

  try {
    await sql`
      delete from digital_twin_subscriptions
      where not exists (select 1 from users u where u.id = digital_twin_subscriptions.customer_id)
    `;
  } catch {}

  return {
    ok: true,
    kept: keepIds.size,
    removed: ids.length,
    message: `Cleanup complete. Only designer kept: Mira Kapoor. Plus Aarav Sharma, all admins, and any notified customer. Removed ${ids.length} user(s); orphan rows in payment_ledger and other tables cleaned.`,
  };
}
