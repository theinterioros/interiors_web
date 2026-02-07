import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { sql } from "@/lib/db";
import PageTabs from "@/components/ui/PageTabs";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ status?: string }> };

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "LEAD", label: "Leads" },
  { value: "COMPLETED", label: "Completed" },
  { value: "OTHER", label: "Other" },
];

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterStatus = params?.status ?? "";

  const projects = await sql<{
    id: string;
    title: string;
    status: string;
    created_at: Date;
    updated_at: Date;
    customer_name: string | null;
    customer_email: string;
    designer_name: string | null;
    designer_email: string | null;
    milestone_count: string;
    approved_count: string;
    submitted_count: string;
  }>`
    select p.id, p.title, p.status, p.created_at, p.updated_at,
           cu.name as customer_name, cu.email as customer_email,
           fu.name as designer_name, fu.email as designer_email,
           (select count(*)::text from milestones m where m.project_id = p.id) as milestone_count,
           (select count(*)::text from milestones m where m.project_id = p.id and m.status = 'APPROVED') as approved_count,
           (select count(*)::text from milestones m where m.project_id = p.id and m.status = 'SUBMITTED') as submitted_count
    from projects p
    join users cu on cu.id = p.customer_id
    left join users fu on fu.id = p.firm_id
    order by p.updated_at desc
  `;

  const counts = {
    all: projects.length,
    ACTIVE: projects.filter((p) => p.status === "ACTIVE").length,
    LEAD: projects.filter((p) => p.status === "LEAD").length,
    COMPLETED: projects.filter((p) => p.status === "COMPLETED").length,
    OTHER: projects.filter((p) => !["ACTIVE", "LEAD", "COMPLETED"].includes(p.status)).length,
  };

  const filtered =
    filterStatus === "OTHER"
      ? projects.filter((p) => !["ACTIVE", "LEAD", "COMPLETED"].includes(p.status))
      : filterStatus
        ? projects.filter((p) => p.status === filterStatus)
        : projects;

  const tabs = STATUS_TABS.map((s) => ({
    label: s.label,
    href: s.value ? `/admin/projects?status=${s.value}` : "/admin/projects",
    active: (filterStatus || "") === s.value,
    count: s.value === "" ? counts.all : counts[s.value as keyof typeof counts],
  }));

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <FolderKanban className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Projects</p>
        </div>
        <h1 className="heading-lg mb-1">All projects</h1>
        <p className="text-sm text-[var(--text-muted)]">
          View all projects with status, customer, designer, and milestone counts. Use tabs to filter by status (Active, Leads, Completed, Other).
        </p>
      </header>

      <PageTabs tabs={tabs} />

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 sm:p-8 text-center text-[var(--text-muted)]">
          {filterStatus
            ? `No ${STATUS_TABS.find((s) => s.value === filterStatus)?.label.toLowerCase() ?? "projects"} yet.`
            : "No projects created yet."}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Designer</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Milestones</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Approved</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Awaiting</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr key={project.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-subtle)]/30">
                    <td className="py-3 px-4 text-[var(--foreground)] whitespace-nowrap">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[var(--foreground)]">{project.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[var(--foreground)]">{project.customer_name ?? "—"}</span>
                      <span className="block text-xs text-[var(--text-muted)] truncate max-w-[180px]" title={project.customer_email}>
                        {project.customer_email}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[var(--foreground)]">{project.designer_name ?? "—"}</span>
                      <span className="block text-xs text-[var(--text-muted)] truncate max-w-[180px]" title={project.designer_email ?? ""}>
                        {project.designer_email ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{project.milestone_count}</td>
                    <td className="py-3 px-4 text-right text-[var(--foreground)]">{project.approved_count}</td>
                    <td className="py-3 px-4 text-right">
                      {project.submitted_count !== "0" ? (
                        <span className="text-[var(--accent-amber)] font-medium">{project.submitted_count}</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          project.status === "ACTIVE"
                            ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]"
                            : project.status === "LEAD"
                              ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                              : project.status === "ACCEPTED"
                                ? "bg-[var(--brand)]/20 text-[var(--brand)]"
                                : project.status === "COMPLETED"
                                  ? "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                                  : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/projects/${project.id}`} className="text-[var(--brand)] hover:underline font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
