import { FolderKanban } from "lucide-react";
import { sql } from "@/lib/db";

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
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <FolderKanban className="h-4 w-4 text-amber-600" />
            Projects
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">All projects</h1>
          <p className="text-sm text-neutral-500">Track overall project status.</p>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-neutral-500">No projects created yet.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{project.title}</p>
                    <p className="text-xs text-neutral-500">
                      {project.customer_email} → {project.firm_email}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
