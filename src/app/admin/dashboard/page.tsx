import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [[users], [pendingFirms], [projects], [payments]] = await Promise.all([
    sql<{ count: number }>`select count(*)::int as count from users`,
    sql<{ count: number }>`select count(*)::int as count from firm_profiles where status = 'PENDING'`,
    sql<{ count: number }>`select count(*)::int as count from projects`,
    sql<{ count: number }>`select count(*)::int as count from payment_ledger where status = 'HELD'`,
  ]);

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
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <LayoutDashboard className="h-4 w-4 text-amber-600" />
            Admin Dashboard
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Control center</h1>
          <p className="text-sm text-neutral-500">Monitor users, approvals, and payments.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Users</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{users.count}</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Firm approvals</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{pendingFirms.count}</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Projects</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{projects.count}</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Held payments</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{payments.count}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Blob Storage</p>
              <h2 className="text-lg font-semibold text-neutral-900">Usage summary</h2>
              <p className="text-sm text-neutral-500">
                Estimated from files recorded in the database.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Total</p>
              <p className="text-2xl font-semibold text-neutral-900">{formatBytes(totalBytes)}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Portfolio</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">
                {formatBytes(Number(portfolio.total))}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Milestones</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">
                {formatBytes(Number(milestones.total))}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Digital Twin</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">
                {formatBytes(Number(digitalTwin.total))}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/admin/users" className="card hover:border-neutral-300">
            <h3 className="text-lg font-semibold text-neutral-900">Users</h3>
            <p className="text-sm text-neutral-500">Browse all users and roles.</p>
          </Link>
          <Link href="/admin/designers" className="card hover:border-neutral-300">
            <h3 className="text-lg font-semibold text-neutral-900">Firm approvals</h3>
            <p className="text-sm text-neutral-500">Review and approve firm profiles.</p>
          </Link>
          <Link href="/admin/payments" className="card hover:border-neutral-300">
            <h3 className="text-lg font-semibold text-neutral-900">Payment control</h3>
            <p className="text-sm text-neutral-500">Hold or release milestone payments.</p>
          </Link>
          <Link href="/admin/projects" className="card hover:border-neutral-300">
            <h3 className="text-lg font-semibold text-neutral-900">Projects</h3>
            <p className="text-sm text-neutral-500">View all project activity.</p>
          </Link>
          <Link href="/admin/pricing" className="card hover:border-neutral-300">
            <h3 className="text-lg font-semibold text-neutral-900">Pricing configuration</h3>
            <p className="text-sm text-neutral-500">Manage rates by city and pincode.</p>
          </Link>
          <Link href="/admin/settings" className="card hover:border-neutral-300">
            <h3 className="text-lg font-semibold text-neutral-900">Admin settings</h3>
            <p className="text-sm text-neutral-500">OTP, SMTP, and social links.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
