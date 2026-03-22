import { CreditCard, ShieldCheck, Info } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import { paymentTypeLabel } from "@/lib/paymentLabels";
import PageTabs from "@/components/ui/PageTabs";
import TableFilterBar from "@/components/ui/TableFilterBar";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ status?: string; q?: string }> };

function matchSearch(row: LedgerRow, q: string): boolean {
  const s = q.toLowerCase();
  return (
    (row.project_title ?? "").toLowerCase().includes(s) ||
    (row.milestone_title ?? "").toLowerCase().includes(s) ||
    (row.firm_name ?? "").toLowerCase().includes(s) ||
    (row.firm_email ?? "").toLowerCase().includes(s)
  );
}

type LedgerRow = {
  id: string;
  type: string;
  status: string;
  amount: number;
  project_title: string | null;
  milestone_title: string | null;
  firm_name: string | null;
  firm_email: string | null;
  created_at: Date;
};

export default async function CustomerPaymentsPage({ searchParams }: PageProps) {
  const user = await requireCustomerPaid();
  const params = await searchParams;
  const filterStatus = params?.status ?? "";
  const q = (params?.q ?? "").trim();

  const ledger = await sql<LedgerRow>`
    select
      p.id, p.type, p.status, p.amount,
      pr.title as project_title, m.title as milestone_title,
      fu.name as firm_name, fu.email as firm_email,
      p.created_at
    from payment_ledger p
    left join projects pr on pr.id = p.project_id
    left join milestones m on m.id = p.milestone_id
    left join users fu on fu.id = p.firm_id
    where p.customer_id = ${user.id}
    order by p.created_at desc
  `;

  const heldRows = ledger.filter((r) => r.status === "HELD");
  const heldTotal = heldRows.reduce((s, r) => s + r.amount, 0);
  const releasedRows = ledger.filter((r) => r.status === "RELEASED");
  const releasedTotal = releasedRows.reduce((s, r) => s + r.amount, 0);

  const statusFiltered =
    filterStatus === "HELD"
      ? heldRows
      : filterStatus === "RELEASED"
        ? releasedRows
        : ledger;

  const ledgerFiltered = q ? statusFiltered.filter((row) => matchSearch(row, q)) : statusFiltered;

  const base = "/customer/payments";
  const query = (status: string) => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return s ? `?${s}` : "";
  };
  const ledgerTabs = [
    { label: "All", href: base + query(""), active: !filterStatus, count: ledger.length },
    { label: "In escrow", href: base + query("HELD"), active: filterStatus === "HELD", count: heldRows.length },
    { label: "Released", href: base + query("RELEASED"), active: filterStatus === "RELEASED", count: releasedRows.length },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Payments</p>
        </div>
        <h1 className="heading-lg mb-1">Payment history</h1>
        <p className="text-sm text-[var(--text-muted)] mb-2">
          Milestone payments only. Funds are held in escrow until released to your designer after you approve each milestone.
        </p>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]/50 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-[var(--brand)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--text-muted)]">
            <strong className="text-[var(--foreground)]">Escrow:</strong> When you approve a milestone, the amount is held securely and then released to your designer. &quot;In escrow&quot; means awaiting release; &quot;Released&quot; means the designer has been paid.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-amber-light)]/20 p-5">
          <p className="eyebrow mb-1">In escrow</p>
          <p className="text-2xl font-semibold text-[var(--foreground)]">₹{heldTotal.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Approved by you; not yet released to your designer</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-white p-5">
          <p className="eyebrow mb-1">Released</p>
          <p className="text-2xl font-semibold text-[var(--foreground)]">₹{releasedTotal.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Already released to your designer</p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Payment ledger</h2>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Date, type, project or milestone, designer, amount, and status.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <PageTabs tabs={ledgerTabs} className="mb-0 sm:flex-1 sm:min-w-0 order-2 sm:order-1" />
            <div className="w-full sm:w-auto order-1 sm:order-2">
            <TableFilterBar
              value={q}
              placeholder="Search by project, milestone, designer…"
              preserveParams={filterStatus ? { status: filterStatus } : {}}
            />
            </div>
          </div>
        </div>
        {ledgerFiltered.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            {q
              ? "No payments match your search. Try a different term or clear the search."
              : filterStatus
                ? `No ${filterStatus === "HELD" ? "escrow" : "released"} payments.`
                : "No milestone payments yet. Approved milestones will appear here as In escrow until released to your designer."}
          </div>
        ) : (
          <div className="table-wrap overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Payment type</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Particulars</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">To designer</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Amount</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {ledgerFiltered.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 px-4 text-[var(--foreground)]">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{paymentTypeLabel(row.type)}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {row.project_title && row.milestone_title
                        ? `${row.project_title} / ${row.milestone_title}`
                        : row.milestone_title ?? row.project_title ?? "—"}
                    </td>
                    <td className="py-3 px-4">{row.type === "CUSTOMER_REGISTRATION_FEE" ? "—" : (row.firm_name ?? row.firm_email ?? "—")}</td>
                    <td className="py-3 px-4 text-right font-medium">₹{row.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={
                          row.status === "HELD"
                            ? "rounded-full bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] px-2.5 py-1 text-xs font-medium"
                            : "rounded-full bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)] px-2.5 py-1 text-xs font-medium"
                        }
                      >
                        {row.status === "HELD" ? "In escrow" : "Released"}
                      </span>
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
