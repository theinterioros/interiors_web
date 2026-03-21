import Link from "next/link";
import { LayoutDashboard, Activity, Sparkles } from "lucide-react";
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
  ]);

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
        <h1 className="heading-lg mb-1">Platform overview</h1>
        <p className="text-sm text-[var(--text-muted)]">Escrow balance, platform revenue, and project activity at a glance.</p>
      </header>

      <FadeIn delay={0.05}>
        <div className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand-light)]/45 p-4 sm:p-5">
          <Link
            href="/admin/settings#ai-prompts"
            className="flex items-center gap-4 rounded-xl border border-[var(--brand)]/25 bg-white/80 p-4 transition-colors hover:bg-white"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)] text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--foreground)]">AI Prompt Controls</p>
              <p className="text-sm text-[var(--text-muted)]">
                Update Estimator and Visualization prompts safely with fixed I/O contracts.
              </p>
            </div>
            <span className="text-sm font-medium text-[var(--brand)] shrink-0">Open</span>
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={0.06}>
        <div className="rounded-lg border border-[var(--brand)]/20 bg-[var(--surface-subtle)]/50 p-4 sm:p-5">
          <h2 className="heading-md mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--brand)]" />
            Health Metrics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="eyebrow mb-1">Escrow balance</p>
              <p className="text-xl font-semibold text-[var(--foreground)]">₹{escrowBalance.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Funds held, not yet released to designers</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Platform revenue</p>
              <p className="text-xl font-semibold text-[var(--foreground)]">₹{totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Subscriptions and commissions</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Delayed projects</p>
              <p className={`text-xl font-semibold ${delayedProjects > 0 ? "text-[var(--accent-amber)]" : "text-[var(--foreground)]"}`}>
                {delayedProjects}
              </p>
              <p className="text-xs text-[var(--text-muted)]">No milestone update in 14+ days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full shrink-0 ${delayedProjects === 0 && activeProjects.count > 0 ? "bg-green-500" : delayedProjects > 0 ? "bg-[var(--accent-amber)]" : "bg-[var(--border)]"}`} />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">System health</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {delayedProjects === 0 ? "Normal" : "Review delayed projects"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
          <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-md">Recent projects</h2>
              <Link href="/admin/projects" className="text-sm text-[var(--brand)] hover:underline">View all</Link>
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
