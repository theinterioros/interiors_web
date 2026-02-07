import Link from "next/link";
import { FolderKanban, LayoutDashboard, Users } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";
import { initiateProjectAction } from "@/app/actions/project";

export const dynamic = "force-dynamic";

export default async function FirmDashboardPage() {
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

  const activeProjects = await sql<{
    id: string;
    title: string;
    status: string;
  }>`
    select id, title, status
    from projects
    where firm_id = ${user.id} and status = 'ACTIVE'
    order by created_at desc
  `;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <LayoutDashboard className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Designer Dashboard</p>
          </div>
          <h1 className="heading-lg mb-3">Your workstream</h1>
          <p className="text-[var(--text-muted)]">
            Manage incoming requests, milestones, and approvals.
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--brand)]" />
              <h2 className="heading-md">Leads (after meetup → Initiate Project)</h2>
            </div>
            <Link href="/firm/leads" className="text-sm text-[var(--brand)] hover:underline">
              View all leads
            </Link>
          </div>
          {leads.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No leads yet.</p>
          ) : (
            <StaggerChildren className="grid gap-4 md:grid-cols-2">
              {leads.map((project) => (
                <FadeInItem key={project.id}>
                  <div className="card flex flex-col">
                    <p className="eyebrow mb-1">LEAD</p>
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-1">
                      {project.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mb-3">
                      Requested by {project.customer_name ?? project.customer_email}
                    </p>
                    <form action={initiateProjectAction} className="mt-auto">
                      <input type="hidden" name="projectId" value={project.id} />
                      <button type="submit" className="btn btn-primary w-full text-sm">
                        Initiate Project
                      </button>
                    </form>
                  </div>
                </FadeInItem>
              ))}
            </StaggerChildren>
          )}
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex items-center gap-2 mb-4">
            <FolderKanban className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="heading-md">Active projects</h2>
          </div>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No active projects yet.</p>
          ) : (
            <StaggerChildren className="grid gap-4 md:grid-cols-2">
              {activeProjects.map((project) => (
                <FadeInItem key={project.id}>
                  <Link
                    href={`/firm/projects/${project.id}`}
                    className="card hover:border-[var(--border-strong)] transition-colors"
                  >
                    <p className="eyebrow mb-2">{project.status}</p>
                    <p className="heading-md">{project.title}</p>
                  </Link>
                </FadeInItem>
              ))}
            </StaggerChildren>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
