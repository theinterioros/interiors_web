import Link from "next/link";
import { LayoutDashboard, Activity } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [
    [users],
    [pendingFirms],
    [projects],
    [activeProjects],
    [payments],
    [firmsPendingPayment],
    [escrowRow],
    [subscriptionRow],
    [commissionRow],
    [delayedCountRow],
  ] = await Promise.all([
    sql<{ count: number }>`select count(*)::int as count from users`,
    sql<{ count: number }>`select count(*)::int as count from firm_profiles where status = 'PENDING'`,
    sql<{ count: number }>`select count(*)::int as count from projects`,
    sql<{ count: number }>`select count(*)::int as count from projects where status = 'ACTIVE'`,
    sql<{ count: number }>`select count(*)::int as count from payment_ledger where status = 'HELD'`,
    sql<{ count: number }>`
      select count(*)::int as count from users u
      where u.role = 'FIRM' and not exists (
        select 1 from payment_ledger p
        where p.firm_id = u.id and p.type = 'FIRM_REGISTRATION_FEE' and p.status = 'RELEASED'
      )
    `,
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

  const [[portfolio], [milestones], [digitalTwin]] = await Promise.all([
    sql<{ total: number }>`
      select coalesce(sum(size_bytes), 0)::bigint as total
      from firm_portfolio_files
    `,
    sql<{ total: number }>`
      select coalesce(sum(size_bytes), 0)::bigint as total
      from milestone_images
    `,
    sql<{ total: number }>`
      select coalesce(sum(size_bytes), 0)::bigint as total
      from digital_twin_files
    `,
  ]);

  const totalBytes = Number(portfolio.total) + Number(milestones.total) + Number(digitalTwin.total);
  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
  };

  return (
    <div>
      <FadeIn className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <LayoutDashboard className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Admin Dashboard</p>
        </div>
        <h1 className="heading-lg mb-3">Command center</h1>
        <p className="text-[var(--text-muted)]">Health metrics, escrow, and platform earnings.</p>
      </FadeIn>

      <FadeIn delay={0.05} className="mb-8">
        <div className="card border-[var(--brand)]/20 bg-[var(--surface-subtle)]/50">
          <h2 className="heading-md mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--brand)]" />
            Health metrics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="eyebrow mb-1">Current escrow balance</p>
              <p className="text-xl font-semibold text-[var(--foreground)]">₹{escrowBalance.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Funds held (not yet released)</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Total platform earnings</p>
              <p className="text-xl font-semibold text-[var(--foreground)]">₹{totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Subscriptions + commissions</p>
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

      <StaggerChildren className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 [&>*]:min-w-0">
          <FadeInItem>
            <div className="card">
              <p className="eyebrow mb-2">Users</p>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{users.count}</p>
            </div>
          </FadeInItem>
          <FadeInItem>
            <div className="card">
              <p className="eyebrow mb-2">Designer approvals</p>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{pendingFirms.count}</p>
            </div>
          </FadeInItem>
          <FadeInItem>
            <Link href="/admin/projects" className="block w-full card hover:border-[var(--border-strong)] transition-colors">
              <p className="eyebrow mb-2">Projects</p>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{projects.count}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{activeProjects.count} active</p>
            </Link>
          </FadeInItem>
          <FadeInItem>
            <Link href="/admin/payments" className="block w-full card hover:border-[var(--border-strong)] transition-colors">
              <p className="eyebrow mb-2">Held payments</p>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{payments.count}</p>
            </Link>
          </FadeInItem>
        </StaggerChildren>

        <FadeIn delay={0.15} className="mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-md">Active projects</h2>
              <Link href="/admin/projects" className="text-sm text-[var(--brand)] hover:underline">View all</Link>
            </div>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No projects yet.</p>
            ) : (
              <div className="space-y-2">
                {recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    href="/admin/projects"
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

        <FadeIn delay={0.2} className="mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="eyebrow mb-2">Blob Storage</p>
                <h2 className="heading-md mb-2">Usage summary</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Estimated from files recorded in the database.
                </p>
              </div>
              <div className="text-right">
                <p className="eyebrow mb-2">Total</p>
                <p className="text-2xl font-semibold text-[var(--foreground)]">{formatBytes(totalBytes)}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3 [&>*]:min-w-0">
              <div className="card-subtle">
                <p className="eyebrow mb-2">Portfolio</p>
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {formatBytes(Number(portfolio.total))}
                </p>
              </div>
              <div className="card-subtle">
                <p className="eyebrow mb-2">Milestones</p>
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {formatBytes(Number(milestones.total))}
                </p>
              </div>
              <div className="card-subtle">
                <p className="eyebrow mb-2">Digital Twin</p>
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {formatBytes(Number(digitalTwin.total))}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        <StaggerChildren className="grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
          <FadeInItem>
            <Link href="/admin/users" className="block w-full card hover:border-[var(--border-strong)] transition-colors">
              <h3 className="heading-md mb-2">Users</h3>
              <p className="text-sm text-[var(--text-muted)]">Browse all users and roles.</p>
            </Link>
          </FadeInItem>
          <FadeInItem>
            <Link href="/admin/designers" className="block w-full card hover:border-[var(--border-strong)] transition-colors">
              <h3 className="heading-md mb-2">Designer approvals</h3>
              <p className="text-sm text-[var(--text-muted)]">Review and approve designer profiles.</p>
            </Link>
          </FadeInItem>
          <FadeInItem>
            <Link href="/admin/payments" className="block w-full card hover:border-[var(--border-strong)] transition-colors">
              <h3 className="heading-md mb-2">Payment control</h3>
              <p className="text-sm text-[var(--text-muted)]">Hold or release milestone payments.</p>
            </Link>
          </FadeInItem>
          <FadeInItem>
            <Link href="/admin/projects" className="block w-full card hover:border-[var(--border-strong)] transition-colors">
              <h3 className="heading-md mb-2">Projects</h3>
              <p className="text-sm text-[var(--text-muted)]">View all projects, milestones, and activity.</p>
            </Link>
          </FadeInItem>
          <FadeInItem>
            <Link href="/admin/firms-pending-payment" className="block w-full card hover:border-[var(--border-strong)] transition-colors">
              <h3 className="heading-md mb-2">Designers pending payment</h3>
              <p className="text-sm text-[var(--text-muted)]">{firmsPendingPayment.count} designer(s) haven’t paid registration fee. Nudge by email.</p>
            </Link>
          </FadeInItem>
          <FadeInItem>
            <Link href="/admin/pricing" className="block w-full card hover:border-[var(--border-strong)] transition-colors">
              <h3 className="heading-md mb-2">AI Estimator pricing</h3>
              <p className="text-sm text-[var(--text-muted)]">Default rate and city/pincode overrides.</p>
            </Link>
          </FadeInItem>
          <FadeInItem>
            <Link href="/admin/settings" className="block w-full card hover:border-[var(--border-strong)] transition-colors">
              <h3 className="heading-md mb-2">Admin settings</h3>
              <p className="text-sm text-[var(--text-muted)]">OTP, SMTP, and social links.</p>
            </Link>
          </FadeInItem>
      </StaggerChildren>
    </div>
  );
}
