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
    firm_email: string;
  }>`
    select p.id, p.title, p.status, cu.email as customer_email, fu.email as firm_email
    from projects p
    join users cu on cu.id = p.customer_id
    join users fu on fu.id = p.firm_id
    order by p.created_at desc
  `;

  return (
    <div>
      <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FolderKanban className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Projects</p>
          </div>
          <h1 className="heading-lg mb-3">All projects</h1>
          <p className="text-[var(--text-muted)]">Track overall project status.</p>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{project.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {project.customer_email} → {project.firm_email}
                      </p>
                    </div>
                    <span className="badge">{project.status}</span>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </StaggerChildren>
        )}
    </div>
  );
}
