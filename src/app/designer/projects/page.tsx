import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import PageTabs from "@/components/ui/PageTabs";
import TableFilterBar from "@/components/ui/TableFilterBar";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ status?: string; q?: string }> };

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "LEAD", label: "Leads" },
  { value: "ACTIVE", label: "Active" },
];

function matchSearch(row: { title: string; customer_name: string | null; customer_email: string }, q: string) {
  const s = q.toLowerCase();
  return (
    row.title.toLowerCase().includes(s) ||
    (row.customer_name ?? "").toLowerCase().includes(s) ||
    (row.customer_email ?? "").toLowerCase().includes(s)
  );
}

export default async function FirmProjectsPage({ searchParams }: PageProps) {
  const user = await requireFirmPaid();
  const params = await searchParams;
  const filterStatus = params?.status ?? "";
  const q = (params?.q ?? "").trim();

  const projects = await sql<{
    id: string;
    title: string;
    status: string;
    created_at: Date;
    updated_at: Date;
    customer_name: string | null;
    customer_email: string;
    milestone_count: string;
  }>`
    select p.id, p.title, p.status, p.created_at, p.updated_at,
           u.name as customer_name, u.email as customer_email,
           (select count(*)::text from milestones m where m.project_id = p.id) as milestone_count
    from projects p
    join users u on u.id = p.customer_id
    where p.firm_id = ${user.id}
    order by p.updated_at desc
  `;

  const counts = {
    all: projects.length,
    LEAD: projects.filter((p) => p.status === "LEAD").length,
    ACTIVE: projects.filter((p) => p.status === "ACTIVE").length,
  };

  const statusFiltered =
    filterStatus
      ? projects.filter((p) => p.status === filterStatus)
      : projects;
  const filtered = q ? statusFiltered.filter((p) => matchSearch(p, q)) : statusFiltered;

  const base = "/designer/projects";
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
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FolderKanban className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Projects</p>
        </div>
        <h1 className="heading-lg mb-1">Your Projects</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Leads are meetup requests from customers; initiate a project to turn a lead into an active project with milestones and payments. Use tabs to filter.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4">
        <PageTabs tabs={tabs} className="mb-0 sm:flex-1 sm:min-w-0 order-2 sm:order-1" />
        <div className="w-full sm:w-auto order-1 sm:order-2">
          <TableFilterBar
            value={q}
            placeholder="Search by title or customer…"
            preserveParams={filterStatus ? { status: filterStatus } : {}}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-white p-8 text-center text-[var(--text-muted)]">
          {q
            ? "No projects match your search."
            : filterStatus === "LEAD"
              ? "No leads yet."
              : filterStatus === "ACTIVE"
                ? "No active projects yet."
                : "No projects yet."}
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
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Milestones</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-subtle)]/30">
                    <td className="py-3 px-4 text-[var(--foreground)] whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--foreground)]">{p.title}</td>
                    <td className="py-3 px-4">
                      <span className="text-[var(--foreground)]">{p.customer_name ?? "—"}</span>
                      <span className="block text-xs text-[var(--text-muted)] truncate max-w-[180px]" title={p.customer_email}>
                        {p.customer_email}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{p.milestone_count}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          p.status === "ACTIVE"
                            ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]"
                            : p.status === "ACCEPTED"
                              ? "bg-[var(--brand)]/20 text-[var(--brand)]"
                              : p.status === "COMPLETED"
                                ? "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                                : "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={p.status === "LEAD" ? "/designer/leads" : `/designer/projects/${p.id}`}
                        className="text-[var(--brand)] hover:underline font-medium"
                      >
                        {p.status === "LEAD" ? "View lead" : "View"}
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
