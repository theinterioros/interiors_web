import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { RoleValues } from "@/lib/types";
import {
  User,
  Building2,
  CreditCard,
  FolderKanban,
  Percent,
  ArrowLeft,
} from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import { paymentTypeLabel } from "@/lib/paymentLabels";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage({ params }: PageProps) {
  await requireRole([RoleValues.ADMIN]);
  const { id: userId } = await params;

  const [user] = await sql<{
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
    created_at: Date;
  }>`
    select id, name, email, phone, role, created_at from users where id = ${userId} limit 1
  `;

  if (!user) notFound();

  let profile: {
    id: string;
    firm_name: string | null;
    name: string | null;
    city: string;
    pincode: string;
    status: string;
    platform_margin_pct: number | null;
    margin_accepted_at: Date | null;
  } | null = null;
  let payments: {
    id: string;
    type: string;
    status: string;
    amount: number;
    created_at: Date;
  }[] = [];
  let projects: {
    id: string;
    title: string;
    status: string;
    customer_name: string | null;
    created_at: Date;
  }[] = [];
  let marginHistory: {
    id: string;
    requested_margin_pct: number;
    status: string;
    admin_comment: string | null;
    created_at: Date;
    decided_at: Date | null;
  }[] = [];

  if (user.role === "FIRM") {
    const [p] = await sql<{
      id: string;
      firm_name: string | null;
      name: string | null;
      city: string;
      pincode: string;
      status: string;
      platform_margin_pct: number | null;
      margin_accepted_at: Date | null;
    }>`
      select id, firm_name, name, city, pincode, status, platform_margin_pct, margin_accepted_at
      from firm_profiles where user_id = ${userId} limit 1
    `;
    profile = p ?? null;

    payments = await sql<{
      id: string;
      type: string;
      status: string;
      amount: number;
      created_at: Date;
    }>`
      select id, type, status, amount, created_at
      from payment_ledger
      where firm_id = ${userId}
      order by created_at desc
    `;

    projects = await sql<{
      id: string;
      title: string;
      status: string;
      customer_name: string | null;
      created_at: Date;
    }>`
      select p.id, p.title, p.status, u.name as customer_name, p.created_at
      from projects p
      left join users u on u.id = p.customer_id
      where p.firm_id = ${userId}
      order by p.created_at desc
    `;

    if (profile?.id) {
      try {
        marginHistory = await sql<{
          id: string;
          requested_margin_pct: number;
          status: string;
          admin_comment: string | null;
          created_at: Date;
          decided_at: Date | null;
        }>`
          select id, requested_margin_pct, status, admin_comment, created_at, decided_at
          from margin_requests
          where profile_id = ${profile.id}
          order by created_at desc
        `;
      } catch {
        // margin_requests table may not exist
      }
    }
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-[var(--brand)] hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-[var(--text-muted)]">
            {user.role === "FIRM" ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
          </span>
          <div>
            <h1 className="heading-lg">{user.name ?? user.email}</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {user.email}
              {user.phone && ` · ${user.phone}`}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {user.role === "FIRM" ? "Designer" : user.role === "CUSTOMER" ? "Customer" : "Admin"}
              {" · Joined "}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </FadeIn>

      {user.role === "FIRM" && profile && (
        <>
          <FadeIn delay={0.05}>
            <section className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
                <h2 className="font-semibold text-[var(--foreground)]">Profile</h2>
              </div>
              <div className="p-4 grid gap-2 sm:grid-cols-2 text-sm">
                <p><span className="text-[var(--text-muted)]">Firm name</span> {profile.firm_name ?? profile.name ?? "—"}</p>
                <p><span className="text-[var(--text-muted)]">City / Pincode</span> {profile.city} · {profile.pincode}</p>
                <p>
                  <span className="text-[var(--text-muted)]">Status</span>{" "}
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    profile.status === "APPROVED" ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]" :
                    profile.status === "PENDING" ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]" :
                    "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                  }`}>
                    {profile.status}
                  </span>
                </p>
                <p><span className="text-[var(--text-muted)]">Platform margin</span> {profile.platform_margin_pct != null ? `${profile.platform_margin_pct}%` : "—"}</p>
                <p><span className="text-[var(--text-muted)]">Margin accepted</span> {profile.margin_accepted_at ? new Date(profile.margin_accepted_at).toLocaleString() : "—"}</p>
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.1}>
            <section className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-[var(--text-muted)]" />
                  <h2 className="font-semibold text-[var(--foreground)]">Margin history</h2>
                </div>
              </div>
              {marginHistory.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-muted)]">No margin requests yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Requested %</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Status</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Submitted</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Decided</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Admin comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marginHistory.map((r) => (
                        <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 px-4 font-medium">{r.requested_margin_pct}%</td>
                          <td className="py-2 px-4">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.status === "APPROVED" ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]" :
                              r.status === "REJECTED" ? "bg-red-100 text-red-700" :
                              "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-[var(--text-muted)]">{new Date(r.created_at).toLocaleString()}</td>
                          <td className="py-2 px-4 text-[var(--text-muted)]">{r.decided_at ? new Date(r.decided_at).toLocaleString() : "—"}</td>
                          <td className="py-2 px-4 text-[var(--text-muted)] max-w-xs truncate">{r.admin_comment ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </FadeIn>

          <FadeIn delay={0.15}>
            <section className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[var(--text-muted)]" />
                  <h2 className="font-semibold text-[var(--foreground)]">Payments</h2>
                </div>
              </div>
              {payments.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-muted)]">No payments yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Type</th>
                        <th className="text-right py-2 px-4 font-medium text-[var(--text-muted)]">Amount</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Status</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 px-4">{paymentTypeLabel(p.type)}</td>
                          <td className="py-2 px-4 text-right font-medium">₹{p.amount.toLocaleString()}</td>
                          <td className="py-2 px-4">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              p.status === "RELEASED" ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]" :
                              p.status === "HELD" ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]" :
                              "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-[var(--text-muted)]">{new Date(p.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </FadeIn>

          <FadeIn delay={0.2}>
            <section className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-[var(--text-muted)]" />
                  <h2 className="font-semibold text-[var(--foreground)]">Projects</h2>
                </div>
                <Link href="/admin/projects" className="text-sm text-[var(--brand)] hover:underline">All projects</Link>
              </div>
              {projects.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-muted)]">No projects yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Title</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Customer</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Status</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]">Created</th>
                        <th className="text-left py-2 px-4 font-medium text-[var(--text-muted)]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((proj) => (
                        <tr key={proj.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 px-4 font-medium">{proj.title}</td>
                          <td className="py-2 px-4 text-[var(--text-muted)]">{proj.customer_name ?? "—"}</td>
                          <td className="py-2 px-4">
                            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                              {proj.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-[var(--text-muted)]">{new Date(proj.created_at).toLocaleDateString()}</td>
                          <td className="py-2 px-4">
                            <Link href={`/admin/projects/${proj.id}`} className="text-[var(--brand)] hover:underline">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </FadeIn>
        </>
      )}

      {user.role !== "FIRM" && (
        <FadeIn delay={0.05}>
          <div className="rounded-lg border border-[var(--border)] bg-white p-6 text-sm text-[var(--text-muted)]">
            History, payments, and margin are shown for designers. For customers and admins, use Payments and Projects from the main admin menu.
          </div>
        </FadeIn>
      )}
    </div>
  );
}
