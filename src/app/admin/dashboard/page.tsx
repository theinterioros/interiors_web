import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [users, pendingDesigners, projects, payments] = await Promise.all([
    prisma.user.count(),
    prisma.designerProfile.count({ where: { status: "PENDING" } }),
    prisma.project.count(),
    prisma.paymentLedger.count({ where: { status: "HELD" } }),
  ]);

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Admin Dashboard</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Control center</h1>
          <p className="text-sm text-neutral-500">Monitor users, approvals, and payments.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Users</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{users}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Designer approvals</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{pendingDesigners}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Projects</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{projects}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Held payments</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{payments}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/admin/users" className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400">
            <h3 className="text-lg font-semibold text-neutral-900">Users</h3>
            <p className="text-sm text-neutral-500">Browse all users and roles.</p>
          </Link>
          <Link href="/admin/designers" className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400">
            <h3 className="text-lg font-semibold text-neutral-900">Designer approvals</h3>
            <p className="text-sm text-neutral-500">Review and approve designer profiles.</p>
          </Link>
          <Link href="/admin/payments" className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400">
            <h3 className="text-lg font-semibold text-neutral-900">Payment control</h3>
            <p className="text-sm text-neutral-500">Hold or release milestone payments.</p>
          </Link>
          <Link href="/admin/projects" className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400">
            <h3 className="text-lg font-semibold text-neutral-900">Projects</h3>
            <p className="text-sm text-neutral-500">View all project activity.</p>
          </Link>
          <Link href="/admin/pricing" className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400">
            <h3 className="text-lg font-semibold text-neutral-900">Pricing configuration</h3>
            <p className="text-sm text-neutral-500">Manage rates by city and pincode.</p>
          </Link>
          <Link href="/admin/settings" className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400">
            <h3 className="text-lg font-semibold text-neutral-900">Admin settings</h3>
            <p className="text-sm text-neutral-500">OTP, SMTP, and social links.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
