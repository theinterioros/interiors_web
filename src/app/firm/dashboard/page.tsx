import Link from "next/link";
import { FolderKanban, LayoutDashboard, Users } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import { initiateProjectAction } from "@/app/actions/project";
import { hasFirmPaidRegistration } from "@/lib/registrationPayments";
import DashboardMarginSection from "@/components/firm/DashboardMarginSection";

export const dynamic = "force-dynamic";

export default async function FirmDashboardPage() {
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

  const leads = await sql<{
    id: string;
    title: string;
    customer_name: string | null;
    customer_email: string;
    status: string;
  }>`
    select p.id, p.title, u.name as customer_name, u.email as customer_email, p.status
    from projects p
    join users u on u.id = p.customer_id
    where p.firm_id = ${user.id} and p.status = 'LEAD'
    order by p.created_at desc
  `;

  const activeProjects = await sql<{
    id: string;
    title: string;
    status: string;
    updated_at: Date;
    milestone_count: string;
    submitted_count: string;
  }>`
    select p.id, p.title, p.status, p.updated_at,
           (select count(*)::text from milestones m where m.project_id = p.id) as milestone_count,
           (select count(*)::text from milestones m where m.project_id = p.id and m.status = 'SUBMITTED') as submitted_count
    from projects p
    where p.firm_id = ${user.id} and p.status = 'ACTIVE'
    order by p.updated_at desc
  `;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Dashboard</p>
        </div>
        <h1 className="heading-lg mb-1">Your workstream</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Incoming leads (meetup requests), active projects, and quick links to payments and profile.
        </p>
      </header>

      <DashboardMarginSection
        profileStatus={profile?.status ?? "PENDING"}
        platformMarginPct={profile?.platform_margin_pct ?? null}
        marginAcceptedAt={profile?.margin_accepted_at ?? null}
        latestRequest={latestRequest}
        marginHistory={marginHistory}
        hasPaid={hasPaid}
        profileComplete={profileComplete}
      />

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Leads</h2>
          </div>
          <Link href="/firm/leads" className="text-sm text-[var(--brand)] hover:underline">
            View all
          </Link>
        </div>
        {leads.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-muted)]">
            No leads yet. After a customer requests a meetup, leads appear here.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {leads.map((project) => (
              <li key={project.id} className="px-4 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <span className="badge text-xs mb-2">LEAD</span>
                    <p className="font-medium text-[var(--foreground)]">{project.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {project.customer_name ?? project.customer_email}
                    </p>
                  </div>
                  <form action={initiateProjectAction} className="shrink-0">
                    <input type="hidden" name="projectId" value={project.id} />
                    <button type="submit" className="btn btn-primary text-sm w-full sm:w-auto">
                      Initiate project
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-[var(--text-muted)]" />
          <h2 className="font-semibold text-[var(--foreground)]">Active projects</h2>
        </div>
        {activeProjects.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-muted)]">
            No active projects yet.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {activeProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/firm/projects/${project.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--surface-subtle)] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--foreground)]">{project.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {project.milestone_count} milestone(s)
                      {project.submitted_count !== "0" && (
                        <span className="text-[var(--accent-amber)] ml-2">· {project.submitted_count} awaiting approval</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[var(--text-muted)]">
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                    <span className="badge">{project.status}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
