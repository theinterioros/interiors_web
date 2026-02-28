import Link from "next/link";
import { BarChart3, PlusCircle, Users } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import PageTabs from "@/components/ui/PageTabs";
import TableFilterBar from "@/components/ui/TableFilterBar";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ status?: string; q?: string }> };

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "LEAD", label: "Leads" },
];

function matchSearch(row: { title: string; designer_name: string | null; designer_email: string | null }, q: string) {
  const s = q.toLowerCase();
  return (
    row.title.toLowerCase().includes(s) ||
    (row.designer_name ?? "").toLowerCase().includes(s) ||
    (row.designer_email ?? "").toLowerCase().includes(s)
  );
}

export default async function CustomerDashboardPage({ searchParams }: PageProps) {
  const user = await requireCustomerPaid();
  const params = await searchParams;
  const filterStatus = params?.status ?? "";
  const q = (params?.q ?? "").trim();

  const projects = await sql<{
    id: string;
    status: string;
    title: string;
    created_at: Date;
    updated_at: Date;
    designer_name: string | null;
    designer_email: string | null;
    milestone_count: string;
    approved_count: string;
    submitted_count: string;
  }>`
    select p.id, p.status, p.title, p.created_at, p.updated_at,
           u.name as designer_name, u.email as designer_email,
           (select count(*)::text from milestones m where m.project_id = p.id) as milestone_count,
           (select count(*)::text from milestones m where m.project_id = p.id and m.status = 'APPROVED') as approved_count,
           (select count(*)::text from milestones m where m.project_id = p.id and m.status = 'SUBMITTED') as submitted_count
    from projects p
    left join users u on u.id = p.firm_id
    where p.customer_id = ${user.id}
    order by p.updated_at desc
  `;

  const counts = {
    all: projects.length,
    ACTIVE: projects.filter((p) => p.status === "ACTIVE").length,
    LEAD: projects.filter((p) => p.status === "LEAD").length,
  };

  const statusFiltered =
    filterStatus
      ? projects.filter((p) => p.status === filterStatus)
      : projects;
  const filtered = q ? statusFiltered.filter((p) => matchSearch(p, q)) : statusFiltered;

  const base = "/customer/dashboard";
  const query = (status: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    const s = params.toString();
    return s ? `?${s}` : "";
  };
  const tabs = STATUS_TABS.map((s) => ({
    label: s.label,
    href: base + query(s.value),
    active: (filterStatus || "") === s.value,
    count: s.value === "" ? counts.all : counts[s.value as keyof typeof counts],
  }));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Dashboard</p>
        </div>
        <h1 className="heading-lg mb-1">Your dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Your projects and design leads in one place. Start a project from Browse designers; then track milestones and payments. Use the tabs to filter by status.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-5">
        <Link
          href="/designers"
          className="flex items-center gap-4 rounded-xl p-4 border border-[var(--border)] bg-[var(--surface-subtle)]/50 hover:bg-[var(--surface-subtle)] transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)] text-white">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--foreground)]">Start a project</p>
            <p className="text-sm text-[var(--text-muted)]">Browse verified designers and send a meetup request.</p>
          </div>
          <Users className="h-5 w-5 text-[var(--text-muted)] shrink-0" />
        </Link>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-[var(--foreground)]">Your projects</h2>
          <div className="flex flex-wrap items-center gap-3">
            <TableFilterBar
              value={q}
              placeholder="Search by title or designer…"
              preserveParams={filterStatus ? { status: filterStatus } : {}}
            />
            <Link href="/designers" className="text-sm text-[var(--brand)] hover:underline">Browse designers</Link>
          </div>
        </div>
        <div className="px-4">
          <PageTabs tabs={tabs} className="mb-4" />
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            <p className="mb-3">
              {q
                ? "No projects match your search. Try a different term or clear the search."
                : filterStatus === "ACTIVE"
                  ? "You have no active projects. Start one from Browse designers."
                  : filterStatus === "LEAD"
                    ? "No new leads at the moment."
                    : "You don’t have any projects yet. Browse designers to get started."}
            </p>
            {!filterStatus && !q && (
              <Link href="/designers" className="btn btn-primary inline-flex items-center gap-2 text-sm mt-3">
                <PlusCircle className="h-4 w-4" />
                Browse designers
              </Link>
            )}
          </div>
        ) : (
          <div className="table-wrap overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Designer</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Milestones</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Approved</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Pending your approval</th>
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
                    <td className="py-3 px-4 font-medium text-[var(--foreground)]">{project.title}</td>
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
                                : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/customer/projects/${project.id}`} className="text-[var(--brand)] hover:underline font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
