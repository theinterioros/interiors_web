import Link from "next/link";
import { FolderKanban, LayoutDashboard, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FirmDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

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
    <div className="min-h-screen bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)] px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <LayoutDashboard className="h-4 w-4 text-amber-600" />
            Firm Dashboard
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Your workstream</h1>
          <p className="text-sm text-neutral-500">
            Manage incoming requests, milestones, and approvals.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <Users className="h-5 w-5 text-amber-600" />
              Incoming requests
            </div>
            <Link href="/firm/leads" className="text-sm text-neutral-600 underline">
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
          <div className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <FolderKanban className="h-5 w-5 text-amber-600" />
            Active projects
          </div>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-neutral-500">No active projects yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/firm/projects/${project.id}`}
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
