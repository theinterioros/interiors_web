import { FolderKanban } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { RoleValues } from "@/lib/types";
import MilestoneTimeline from "@/components/ui/MilestoneTimeline";
import PageBackLink from "@/components/ui/PageBackLink";
import FadeIn from "@/components/animations/FadeIn";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.ADMIN) {
    return (
      <div className="p-6 text-[var(--text-muted)]">Unauthorized.</div>
    );
  }

  const [project] = await sql<{
    id: string;
    title: string;
    status: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
    customer_name: string | null;
    customer_email: string;
    designer_name: string | null;
    designer_email: string | null;
  }>`
    select p.id, p.title, p.status, p.description, p.created_at, p.updated_at,
           cu.name as customer_name, cu.email as customer_email,
           fu.name as designer_name, fu.email as designer_email
    from projects p
    join users cu on cu.id = p.customer_id
    left join users fu on fu.id = p.firm_id
    where p.id = ${id}
    limit 1
  `;

  if (!project) {
    return (
      <div className="p-6">
        <PageBackLink href="/admin/projects" label="All projects" />
        <p className="text-[var(--text-muted)]">Project not found.</p>
      </div>
    );
  }

  const milestones = await sql<{
    id: string;
    title: string;
    description: string | null;
    amount: number;
    status: string;
    created_at: Date;
  }>`
    select id, title, description, amount, status, created_at
    from milestones
    where project_id = ${project.id}
    order by created_at asc
  `;

  const milestoneIds = milestones.map((m) => m.id);
  const trailByMilestone: Record<string, { event: string; message: string | null; created_at: Date }[]> = {};
  if (milestoneIds.length > 0) {
    const trailRows = await sql<{ milestone_id: string; event: string; message: string | null; created_at: Date }>`
      select milestone_id, event, message, created_at
      from milestone_trail
      where milestone_id = any(${milestoneIds})
      order by created_at asc
    `;
    for (const row of trailRows) {
      if (!trailByMilestone[row.milestone_id]) trailByMilestone[row.milestone_id] = [];
      trailByMilestone[row.milestone_id].push({
        event: row.event,
        message: row.message,
        created_at: row.created_at,
      });
    }
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageBackLink href="/admin/projects" label="All projects" />
        <div className="flex items-center gap-2 mb-1">
          <FolderKanban className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Project Detail</p>
        </div>
        <h1 className="heading-lg mb-3">{project.title}</h1>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            project.status === "ACTIVE"
              ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]"
              : project.status === "LEAD"
                ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
          }`}
        >
          {project.status}
        </span>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">Details</h2>
          </div>
          <dl className="px-4 sm:px-5 py-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-[var(--text-muted)]">Created</dt>
              <dd className="text-sm text-[var(--foreground)]">{new Date(project.created_at).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--text-muted)]">Updated</dt>
              <dd className="text-sm text-[var(--foreground)]">{new Date(project.updated_at).toLocaleDateString()}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-[var(--text-muted)]">Customer</dt>
              <dd className="text-sm text-[var(--foreground)]">{project.customer_name ?? "—"}</dd>
              <dd className="text-xs text-[var(--text-muted)]">{project.customer_email}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-[var(--text-muted)]">Designer</dt>
              <dd className="text-sm text-[var(--foreground)]">{project.designer_name ?? "—"}</dd>
              <dd className="text-xs text-[var(--text-muted)]">{project.designer_email ?? "—"}</dd>
            </div>
            {project.description && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-[var(--text-muted)]">Description</dt>
                <dd className="text-sm text-[var(--foreground)]">{project.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">Milestones</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">{milestones.length} milestone(s)</p>
          </div>
          {milestones.length === 0 ? (
            <div className="px-4 sm:px-5 py-6 text-center text-sm text-[var(--text-muted)]">
              No milestones yet.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                      <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Description</th>
                      <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m) => (
                      <tr key={m.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-3 px-4 font-medium text-[var(--foreground)]">{m.title}</td>
                        <td className="py-3 px-4 text-[var(--text-muted)] max-w-[200px] truncate">{m.description ?? "—"}</td>
                        <td className="py-3 px-4 text-right">₹{m.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              m.status === "APPROVED"
                                ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]"
                                : m.status === "SUBMITTED"
                                  ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                                  : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">{new Date(m.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 sm:px-5 py-4 border-t border-[var(--border)] space-y-4">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Milestone timelines</h3>
                {milestones.map((m) => (
                  <div key={m.id}>
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-2">{m.title}</p>
                    <MilestoneTimeline
                      milestoneCreatedAt={m.created_at}
                      trail={trailByMilestone[m.id] ?? []}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
