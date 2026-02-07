import Link from "next/link";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import { hasFirmPaidRegistration } from "@/lib/registrationPayments";
import DashboardMarginSection from "@/components/firm/DashboardMarginSection";

export const dynamic = "force-dynamic";

export default async function DesignerDashboardPage() {
  const user = await requireFirmPaid();

  const [profile] = await sql<{
    id: string;
    status: string;
    platform_margin_pct: number | null;
    margin_accepted_at: Date | null;
    about: string | null;
    name: string | null;
    firm_name: string | null;
  }>`
    select id, status, platform_margin_pct, margin_accepted_at, about, name, firm_name
    from firm_profiles where user_id = ${user.id} limit 1
  `;

  let latestRequest: { id: string; requested_margin_pct: number; status: string; admin_comment: string | null; created_at: Date } | null = null;
  let marginHistory: { id: string; requested_margin_pct: number; status: string; admin_comment: string | null; created_at: Date }[] = [];
  if (profile?.id) {
    try {
      const rows = await sql<{ id: string; requested_margin_pct: number; status: string; admin_comment: string | null; created_at: Date }>`
        select id, requested_margin_pct, status, admin_comment, created_at
        from margin_requests
        where profile_id = ${profile.id}
        order by created_at desc
      `;
      marginHistory = rows;
      latestRequest = rows[0] ?? null;
    } catch {
      // margin_requests table may not exist yet
    }
  }

  const hasPaid = await hasFirmPaidRegistration(user.id);
  const profileComplete = Boolean(profile?.about?.trim() && (profile?.name?.trim() || profile?.firm_name?.trim()));

  const pendingRequests = await sql<{
    id: string;
    title: string;
    customer_name: string | null;
    customer_email: string;
  }>`
    select p.id, p.title, u.name as customer_name, u.email as customer_email
    from projects p
    join users u on u.id = p.customer_id
    where p.firm_id = ${user.id} and p.status = 'REQUESTED'
    order by p.created_at desc
  `;

  const activeProjects = await sql<{
    id: string;
    title: string;
    status: string;
  }>`
    select id, title, status
    from projects
    where firm_id = ${user.id} and status in ('ACCEPTED', 'ACTIVE')
    order by created_at desc
  `;

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Designer Dashboard</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Your workstream</h1>
          <p className="text-sm text-neutral-500">
            Manage incoming requests, milestones, and approvals.
          </p>
        </div>

        <DashboardMarginSection
          profileStatus={profile?.status ?? "PENDING"}
          platformMarginPct={profile?.platform_margin_pct ?? null}
          marginAcceptedAt={profile?.margin_accepted_at ?? null}
          latestRequest={latestRequest}
          marginHistory={marginHistory}
          hasPaid={hasPaid}
          profileComplete={profileComplete}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Incoming requests</h2>
            <Link href="/designer/leads" className="text-sm text-neutral-600 underline">
              View all leads
            </Link>
          </div>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-neutral-500">No pending requests.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map((project) => (
                <div key={project.id} className="rounded-2xl border border-neutral-200 p-6">
                  <p className="text-sm font-semibold text-neutral-900">{project.title}</p>
                  <p className="text-xs text-neutral-500">
                    Requested by {project.customer_name ?? project.customer_email}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Active projects</h2>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-neutral-500">No active projects yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/designer/projects/${project.id}`}
                  className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400"
                >
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                    {project.status}
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">{project.title}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
