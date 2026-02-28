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

  // Keep any user you have notified (they have at least one notification)
  const notifiedUserIds = (await sql`
    select distinct user_id from notifications
  `) as { user_id: string }[];
  for (const row of notifiedUserIds) {
    keepIds.add(row.user_id);
  }

  const toRemove = allUsers.filter((u) => !keepIds.has(u.id)).map((u) => u.id);

  if (toRemove.length === 0) {
    return {
      ok: true,
      kept: keepIds.size,
      removed: 0,
      message: "No extra users to remove. Kept: demo users (Mira Kapoor, Aarav Sharma), all admins, and any user you have notified.",
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

  return {
    ok: true,
    kept: keepIds.size,
    removed: ids.length,
    message: "Cleanup complete. Kept: demo users (Mira Kapoor, Aarav Sharma), all admins, and any user you have notified.",
  };
}
