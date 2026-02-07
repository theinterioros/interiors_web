import { unstable_cache } from "next/cache";
import { sql } from "@/lib/db";
import type { Role } from "@/lib/types";

export type PendingAction = { label: string; href: string; count: number };

const PENDING_ACTIONS_REVALIDATE = 30;

async function fetchPendingActionsForUser(userId: string, role: Role): Promise<PendingAction[]> {
  const items: PendingAction[] = [];

  if (role === "ADMIN") {
    const [heldRow, pendingApprovalRow, pendingRegRow] = await Promise.all([
      sql<{ count: string }>`select count(*)::text as count from payment_ledger where status = 'HELD'`,
      sql<{ count: string }>`select count(*)::text as count from firm_profiles where status = 'PENDING'`,
      sql<{ count: string }>`
        select count(*)::text as count from users u
        where u.role = 'FIRM'
          and not exists (select 1 from payment_ledger p where p.firm_id = u.id and p.type = 'FIRM_REGISTRATION_FEE' and p.status = 'RELEASED')
      `,
    ]);
    const held = parseInt(heldRow[0]?.count ?? "0", 10);
    if (held > 0) items.push({ label: `${held} payment${held !== 1 ? "s" : ""} awaiting release to designer`, href: "/admin/payments", count: held });
    const pendingApproval = parseInt(pendingApprovalRow[0]?.count ?? "0", 10);
    if (pendingApproval > 0) items.push({ label: `${pendingApproval} designer${pendingApproval !== 1 ? "s" : ""} pending approval`, href: "/admin/designers?status=PENDING", count: pendingApproval });
    const pendingReg = parseInt(pendingRegRow[0]?.count ?? "0", 10);
    if (pendingReg > 0) items.push({ label: `${pendingReg} designer${pendingReg !== 1 ? "s" : ""} pending subscription`, href: "/admin/designers?status=PENDING_REGISTRATION", count: pendingReg });
  }

  if (role === "CUSTOMER") {
    const [submittedRow] = await sql<{ count: string }>`
      select count(*)::text as count from milestones m
      join projects p on p.id = m.project_id
      where p.customer_id = ${userId} and m.status = 'SUBMITTED'
    `;
    const submitted = parseInt(submittedRow?.count ?? "0", 10);
    if (submitted > 0) items.push({ label: `${submitted} milestone${submitted !== 1 ? "s" : ""} awaiting your approval`, href: "/customer/milestones", count: submitted });
  }

  if (role === "FIRM") {
    const [leadsRow, profileRow] = await Promise.all([
      sql<{ count: string }>`select count(*)::text as count from projects where firm_id = ${userId} and status = 'LEAD'`,
      sql<{ margin_accepted_at: Date | null; status: string }>`select margin_accepted_at, status from firm_profiles where user_id = ${userId} limit 1`,
    ]);
    const leads = parseInt(leadsRow[0]?.count ?? "0", 10);
    if (leads > 0) items.push({ label: `${leads} lead${leads !== 1 ? "s" : ""} awaiting your action`, href: "/firm/leads", count: leads });
    const marginAccepted = profileRow[0]?.margin_accepted_at != null;
    let latestMarginStatus: string | null = null;
    try {
      const [profile] = await sql<{ id: string }>`select id from firm_profiles where user_id = ${userId} limit 1`;
      if (profile?.id) {
        const rows = await sql<{ status: string }>`select status from margin_requests where profile_id = ${profile.id} order by created_at desc limit 1`;
        latestMarginStatus = rows[0]?.status ?? null;
      }
    } catch {
      // margin_requests table may not exist
    }
    const paid = await (async (): Promise<boolean> => {
      try {
        const [r] = await sql<{ subscription_expires_at: Date | null }>`select subscription_expires_at from firm_profiles where user_id = ${userId} limit 1`;
        if (r?.subscription_expires_at && new Date(r.subscription_expires_at) > new Date()) return true;
      } catch {
        // subscription_expires_at column may not exist before migration
      }
      const [pay] = await sql<{ id: string }>`select id from payment_ledger where firm_id = ${userId} and type = 'FIRM_REGISTRATION_FEE' and status = 'RELEASED' limit 1`;
      return !!pay;
    })();
    if (!marginAccepted && profileRow[0]?.status === "APPROVED") {
      if (latestMarginStatus === "APPROVED") items.push({ label: "Accept platform margin", href: "/firm/dashboard", count: 1 });
      else items.push({ label: "Declare or update margin", href: "/firm/dashboard", count: 1 });
    }
    if (marginAccepted && !paid) items.push({ label: "Pay registration fee (₹3,000)", href: "/firm/register/pay", count: 1 });
  }

  return items;
}

/** Cached 30s to avoid hitting DB on every layout render. */
export function getPendingActionsForUser(userId: string, role: Role): Promise<PendingAction[]> {
  return unstable_cache(
    () => fetchPendingActionsForUser(userId, role),
    ["pending-actions", userId, role],
    { revalidate: PENDING_ACTIONS_REVALIDATE }
  )();
}
