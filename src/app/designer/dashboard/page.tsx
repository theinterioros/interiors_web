import Link from "next/link";
import { FolderKanban, LayoutDashboard, UserCheck, Users } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import { initiateProjectAction } from "@/app/actions/project";

export const dynamic = "force-dynamic";

export default async function DesignerDashboardPage() {
  const user = await requireFirmPaid();

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

  const acceptedProjects = await sql<{
    id: string;
    title: string;
    customer_name: string | null;
    customer_email: string;
    status: string;
    updated_at: Date;
  }>`
    select p.id, p.title, u.name as customer_name, u.email as customer_email, p.status, p.updated_at
    from projects p
    join users u on u.id = p.customer_id
    where p.firm_id = ${user.id} and p.status = 'ACCEPTED'
    order by p.updated_at desc
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
        <h1 className="heading-lg mb-1">Your dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Incoming meetup requests, accepted projects, and active work. Respond to leads and manage milestones from here.
        </p>
      </header>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Leads</h2>
          </div>
          <Link href="/designer/leads" className="text-sm text-[var(--brand)] hover:underline">
            View all
          </Link>
        </div>
        {leads.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-muted)]">
            No new leads yet. When a customer sends a meetup request, it will appear here.
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
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Accepted projects</h2>
          </div>
          <Link href="/designer/projects" className="text-sm text-[var(--brand)] hover:underline">
            View all
          </Link>
        </div>
        {acceptedProjects.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-muted)]">
            No accepted projects. When you accept a lead, it appears here until you start the project.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {acceptedProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/designer/projects/${project.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--surface-subtle)] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--foreground)]">{project.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {project.customer_name ?? project.customer_email}
                    </p>
                  </div>
                  <span className="badge shrink-0">{project.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Active projects</h2>
          </div>
          <Link href="/designer/projects" className="text-sm text-[var(--brand)] hover:underline">
            View all
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-muted)]">
            No active projects. Start a project from a lead to see it here.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {activeProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/designer/projects/${project.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--surface-subtle)] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--foreground)]">{project.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {project.milestone_count} milestone{project.milestone_count !== "1" ? "s" : ""}
                      {project.submitted_count !== "0" && (
                        <span className="text-[var(--accent-amber)] ml-2">· {project.submitted_count} pending customer approval</span>
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
