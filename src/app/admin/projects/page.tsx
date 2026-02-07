import { FolderKanban } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await sql<{
    id: string;
    title: string;
    status: string;
    customer_email: string;
    designer_email: string | null;
    milestone_count: string;
  }>`
    select p.id, p.title, p.status, cu.email as customer_email, fu.email as designer_email,
           (select count(*)::text from milestones m where m.project_id = p.id) as milestone_count
    from projects p
    join users cu on cu.id = p.customer_id
    left join users fu on fu.id = p.firm_id
    order by p.updated_at desc
  `;

  return (
    <div>
      <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FolderKanban className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Projects</p>
          </div>
          <h1 className="heading-lg mb-3">All projects</h1>
          <p className="text-[var(--text-muted)]">Track project status, customer, designer, and milestones.</p>
        </FadeIn>

        {projects.length === 0 ? (
          <FadeIn>
            <p className="text-sm text-[var(--text-muted)]">No projects created yet.</p>
          </FadeIn>
        ) : (
          <StaggerChildren className="space-y-3">
            {projects.map((project) => (
              <FadeInItem key={project.id}>
                <div className="card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{project.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Customer: {project.customer_email} · Designer: {project.designer_email ?? "—"}
                      </p>
                      <p className="text-xs text-[var(--text-subtle)] mt-1">{project.milestone_count} milestone(s)</p>
                    </div>
                    <span className="badge shrink-0">{project.status}</span>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </StaggerChildren>
        )}
    </div>
  );
}
