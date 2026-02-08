import Link from "next/link";
import { LayoutDashboard, Activity, Percent, BadgeCheck } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [
    [activeProjects],
    [escrowRow],
    [subscriptionRow],
    [commissionRow],
    [delayedCountRow],
    pendingMarginCountRows,
  ] = await Promise.all([
    sql<{ count: number }>`select count(*)::int as count from projects where status = 'ACTIVE'`,
    sql<{ total: string }>`select coalesce(sum(amount), 0)::text as total from payment_ledger where status = 'HELD'`,
    sql<{ total: string }>`
      select coalesce(sum(amount), 0)::text as total from payment_ledger
      where type in ('CUSTOMER_REGISTRATION_FEE', 'ADDITIONAL_PROJECT_FEE') and status = 'RELEASED'
    `,
    sql<{ total: string }>`
      select coalesce(sum(platform_margin_amount), 0)::text as total from payment_ledger
      where status = 'RELEASED' and platform_margin_amount is not null
    `,
    sql<{ count: number }>`
      select count(*)::int as count from projects p
      where p.status = 'ACTIVE'
        and (select max(m.updated_at) from milestones m where m.project_id = p.id) < now() - interval '14 days'
        and (select count(*) from milestones m where m.project_id = p.id) > 0
    `,
    sql<{ count: string }>`select count(*)::text as count from margin_requests where status = 'PENDING'`.catch(() => [{ count: "0" }]),
  ]);

  const pendingMarginCount = parseInt(pendingMarginCountRows?.[0]?.count ?? "0", 10);

  const escrowBalance = parseInt(escrowRow?.total ?? "0", 10);
  const subscriptionRevenue = parseInt(subscriptionRow?.total ?? "0", 10);
  const commissionRevenue = parseInt(commissionRow?.total ?? "0", 10);
  const totalEarnings = subscriptionRevenue + commissionRevenue;
  const delayedProjects = delayedCountRow?.count ?? 0;

  const recentProjects = await sql<{
    id: string;
    title: string;
    status: string;
    customer_email: string;
    designer_email: string | null;
  }>`
    select p.id, p.title, p.status, cu.email as customer_email, fu.email as designer_email
    from projects p
    join users cu on cu.id = p.customer_id
    left join users fu on fu.id = p.firm_id
    order by p.updated_at desc
    limit 8
  `;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Dashboard</p>
        </div>
        <h1 className="heading-lg mb-1">Overview</h1>
        <p className="text-sm text-[var(--text-muted)]">Escrow balance, platform earnings, and project health at a glance.</p>
      </header>

      {pendingMarginCount > 0 && (
        <FadeIn>
          <Link
            href="/admin/designers?status=MARGIN_APPROVAL"
            className="flex items-center gap-4 rounded-lg border-2 border-[var(--accent-amber)]/50 bg-[var(--accent-amber)]/10 p-4 sm:p-5 hover:bg-[var(--accent-amber)]/20 transition-colors"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent-amber)]/20">
              <Percent className="h-6 w-6 text-[var(--accent-amber)]" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-[var(--foreground)]">Margin Requests Need Your Review</p>
              <p className="text-sm text-[var(--text-muted)]">
                {pendingMarginCount} designer{pendingMarginCount !== 1 ? "s" : ""} submitted a margin. Approve or reject with a comment.
              </p>
            </div>
            <span className="badge bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] shrink-0">{pendingMarginCount}</span>
            <span className="text-sm font-medium text-[var(--brand)] shrink-0">Review →</span>
          </Link>
        </FadeIn>
      )}

      <FadeIn delay={0.05}>
        <div className="rounded-lg border border-[var(--brand)]/20 bg-[var(--surface-subtle)]/50 p-4 sm:p-5">
          <h2 className="heading-md mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--brand)]" />
            Health Metrics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="eyebrow mb-1">Current Escrow Balance</p>
              <p className="text-xl font-semibold text-[var(--foreground)]">₹{escrowBalance.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Funds held (not yet released)</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Total Platform Earnings</p>
              <p className="text-xl font-semibold text-[var(--foreground)]">₹{totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Subscriptions + commissions</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Delayed Projects</p>
              <p className={`text-xl font-semibold ${delayedProjects > 0 ? "text-[var(--accent-amber)]" : "text-[var(--foreground)]"}`}>
                {delayedProjects}
              </p>
              <p className="text-xs text-[var(--text-muted)]">No milestone update in 14+ days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full shrink-0 ${delayedProjects === 0 && activeProjects.count > 0 ? "bg-green-500" : delayedProjects > 0 ? "bg-[var(--accent-amber)]" : "bg-[var(--border)]"}`} />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">System Health</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {delayedProjects === 0 ? "Normal" : "Review Delayed Projects"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <h2 className="heading-md flex items-center gap-2">
              <Percent className="h-5 w-5 text-[var(--text-muted)]" />
              Margin Requests
            </h2>
            <Link href="/admin/designers?status=MARGIN_APPROVAL" className="text-sm font-medium text-[var(--brand)] hover:underline inline-flex items-center gap-1">
              <BadgeCheck className="h-4 w-4" />
              Review Margin Requests
            </Link>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Designers submit a margin % from their dashboard. Approve or reject with a comment; they can resubmit. Profile can only be approved after margin is accepted and subscription is paid.
          </p>
          <Link href="/admin/designers?status=MARGIN_APPROVAL" className="btn btn-secondary text-sm">
            Go to Margin Requests
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
          <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-md">Active Projects</h2>
              <Link href="/admin/projects" className="text-sm text-[var(--brand)] hover:underline">View All</Link>
            </div>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No projects yet.</p>
            ) : (
              <div className="space-y-2">
                {recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/projects/${p.id}`}
                    className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 text-sm hover:bg-[var(--surface-subtle)]/50 rounded-lg px-2 -mx-2"
                  >
                    <span className="font-medium text-[var(--foreground)] truncate">{p.title}</span>
                    <span className="badge shrink-0 ml-2">{p.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
      </FadeIn>
    </div>
  );
}
