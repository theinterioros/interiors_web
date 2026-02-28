/**
 * Production DB cleanup: keep only Mira Kapoor (designer), Aarav Sharma (customer), and all admins.
 * Removes all other users and their related records across tables.
 *
 * Identifies keep-users by:
 *   - Designer: name 'Mira Kapoor' or email 'firm@interioros.com' (role FIRM)
 *   - Customer: name 'Aarav Sharma' or email 'customer@interioros.com' (role CUSTOMER)
 *   - All users with role ADMIN
 *
 * Usage: node scripts/cleanup-production-users.mjs
 * Requires: DATABASE_URL or DATABASE_URL_UNPOOLED in .env.local / .env
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = neon(databaseUrl);

const DEMO_CUSTOMER_EMAIL = "customer@interioros.com";
const DEMO_FIRM_EMAIL = "firm@interioros.com";
const DEMO_CUSTOMER_NAME = "Aarav Sharma";
const DEMO_FIRM_NAME = "Mira Kapoor";

async function main() {
  const allUsers = await sql`
    select id, email, name, role from users
  `;

  const keepIds = new Set();
  let keptDesigner = false;
  let keptCustomer = false;

  // Keep all admins
  for (const u of allUsers) {
    if (u.role === "ADMIN") {
      keepIds.add(u.id);
    }
  }

  // Keep exactly one designer: Mira Kapoor (email firm@interioros.com or name match)
  for (const u of allUsers) {
    if (u.role === "FIRM" && (u.email === DEMO_FIRM_EMAIL || u.name === DEMO_FIRM_NAME)) {
      if (!keptDesigner) {
        keepIds.add(u.id);
        keptDesigner = true;
      }
    }
  }

  // Keep exactly one customer: Aarav Sharma (email customer@interioros.com or name match)
  for (const u of allUsers) {
    if (u.role === "CUSTOMER" && (u.email === DEMO_CUSTOMER_EMAIL || u.name === DEMO_CUSTOMER_NAME)) {
      if (!keptCustomer) {
        keepIds.add(u.id);
        keptCustomer = true;
      }
    }
  }

  // Keep any customer you have notified (designers: only Mira Kapoor above)
  const notifiedRows = await sql`
    select distinct n.user_id from notifications n
    join users u on u.id = n.user_id
    where u.role != 'FIRM'
  `;
  for (const row of notifiedRows) {
    keepIds.add(row.user_id);
  }

  const toRemove = allUsers.filter((u) => !keepIds.has(u.id)).map((u) => u.id);

  if (toRemove.length === 0) {
    console.log("No extra users to remove. Kept: Mira Kapoor (only designer), Aarav Sharma, all admins, and any notified customer.");
    return;
  }

  console.log("Keeping users:", [...keepIds].length);
  console.log("Removing users:", toRemove.length, toRemove);
  if (toRemove.length === 0) return;

  const ids = [...toRemove];

  // 1. payment_ledger: delete rows where customer or firm is being removed
  for (const id of ids) {
    await sql`delete from payment_ledger where customer_id = ${id} or firm_id = ${id}`;
  }
  console.log("Deleted payment_ledger rows for removed users.");

  // 2. digital_twin_files
  try {
    for (const id of ids) {
      await sql`delete from digital_twin_files where customer_id = ${id} or uploaded_by = ${id}`;
    }
    console.log("Deleted digital_twin_files rows.");
  } catch (e) {
    console.warn("digital_twin_files:", e.message);
  }

  // 3. digital_twin_subscriptions
  try {
    for (const id of ids) {
      await sql`delete from digital_twin_subscriptions where customer_id = ${id}`;
    }
    console.log("Deleted digital_twin_subscriptions rows.");
  } catch (e) {
    console.warn("digital_twin_subscriptions:", e.message);
  }

  // 4. notifications
  try {
    for (const id of ids) {
      await sql`delete from notifications where user_id = ${id}`;
    }
    console.log("Deleted notifications rows.");
  } catch (e) {
    console.warn("notifications:", e.message);
  }

  // 5. milestone_comments (author_id)
  try {
    for (const id of ids) {
      await sql`delete from milestone_comments where author_id = ${id}`;
    }
    console.log("Deleted milestone_comments rows.");
  } catch (e) {
    console.warn("milestone_comments:", e.message);
  }

  // 6. milestone_trail: set actor_id null
  try {
    for (const id of ids) {
      await sql`update milestone_trail set actor_id = null where actor_id = ${id}`;
    }
    console.log("Nulled milestone_trail.actor_id.");
  } catch (e) {
    console.warn("milestone_trail:", e.message);
  }

  // 7. margin_requests: set decided_by null (if table exists)
  try {
    for (const id of ids) {
      await sql`update margin_requests set decided_by = null where decided_by = ${id}`;
    }
    console.log("Nulled margin_requests.decided_by.");
  } catch (e) {
    console.warn("margin_requests:", e.message);
  }

  // 8. projects: delete where customer is removed (cascades milestones, etc.)
  for (const id of ids) {
    await sql`delete from projects where customer_id = ${id}`;
  }
  console.log("Deleted projects (and cascaded milestones etc.) for removed customers.");

  // 9. projects: unlink firm where firm is removed
  for (const id of ids) {
    await sql`update projects set firm_id = null where firm_id = ${id}`;
  }
  console.log("Set firm_id = null on projects for removed designers.");

  // 10. firm_profiles (cascades to firm_documents, firm_portfolio_works, firm_portfolio_files, margin_requests)
  for (const id of ids) {
    await sql`delete from firm_profiles where user_id = ${id}`;
  }
  console.log("Deleted firm_profiles (and cascaded) for removed designers.");

  // 11. sessions
  for (const id of ids) {
    await sql`delete from sessions where user_id = ${id}`;
  }
  console.log("Deleted sessions for removed users.");

  // 12. users
  for (const id of ids) {
    await sql`delete from users where id = ${id}`;
  }
  console.log("Deleted users.");

  // Orphan cleanup: only relevant data in every table
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
    console.log("Orphan payment_ledger cleaned.");
  } catch (e) {
    console.warn("Orphan payment_ledger:", e.message);
  }
  try {
    await sql`delete from notifications where not exists (select 1 from users u where u.id = notifications.user_id)`;
    console.log("Orphan notifications cleaned.");
  } catch (e) {
    console.warn("Orphan notifications:", e.message);
  }
  try {
    await sql`
      delete from digital_twin_files
      where not exists (select 1 from users u where u.id = digital_twin_files.customer_id)
         or not exists (select 1 from users u where u.id = digital_twin_files.uploaded_by)
         or (project_id is not null and not exists (select 1 from projects p where p.id = digital_twin_files.project_id))
    `;
    await sql`delete from digital_twin_subscriptions where not exists (select 1 from users u where u.id = digital_twin_subscriptions.customer_id)`;
    console.log("Orphan digital_twin tables cleaned.");
  } catch (e) {
    console.warn("Orphan digital_twin:", e.message);
  }

  console.log("Cleanup complete. Only designer kept: Mira Kapoor. Plus Aarav Sharma, all admins, and any notified customer. Orphan rows removed.");
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
