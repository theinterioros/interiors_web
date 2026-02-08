import { CreditCard, Clock, Lock, CheckCircle, Info } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import { paymentTypeLabel } from "@/lib/paymentLabels";

export const dynamic = "force-dynamic";

type LedgerRow = {
  id: string;
  type: string;
  status: string;
  amount: number;
  platform_margin_amount: number | null;
  project_title: string | null;
  milestone_title: string | null;
  customer_name: string | null;
  customer_email: string | null;
  created_at: Date;
};

export default async function FirmPaymentsPage() {
  const user = await requireFirmPaid();

  const [ledger, pendingMilestones] = await Promise.all([
    sql<LedgerRow>`
      select
        p.id, p.type, p.status, p.amount, p.platform_margin_amount,
        pr.title as project_title, m.title as milestone_title,
        cu.name as customer_name, cu.email as customer_email,
        p.created_at
      from payment_ledger p
      left join projects pr on pr.id = p.project_id
      left join milestones m on m.id = p.milestone_id
      left join users cu on cu.id = p.customer_id
      where p.firm_id = ${user.id}
      order by p.created_at desc
    `,
    sql<{ title: string; amount: number; project_title: string }>`
      select m.title, m.amount, p.title as project_title
      from milestones m
      join projects p on p.id = m.project_id
      where p.firm_id = ${user.id} and m.status in ('PENDING', 'IN_PROGRESS')
      order by m.created_at asc
    `,
  ]);

  const pendingTotal = pendingMilestones.reduce((s, r) => s + r.amount, 0);
  const heldRows = ledger.filter((r) => r.status === "HELD");
  const heldTotal = heldRows.reduce((s, r) => s + r.amount, 0);
  const releasedRows = ledger.filter((r) => r.status === "RELEASED");
  const dispatchedToDesigner = releasedRows.reduce((s, r) => s + (r.amount - (r.platform_margin_amount ?? 0)), 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Payments</p>
        </div>
        <h1 className="heading-lg mb-1">Your Earnings</h1>
        <p className="text-sm text-[var(--text-muted)] mb-2">
          Track pending milestones, amounts in escrow (awaiting admin release), and payouts already sent to you. The ledger shows date, payment type, particulars, customer, amount, margin, and what you receive.
        </p>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]/50 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-[var(--brand)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--text-muted)]">
            <strong className="text-[var(--foreground)]">Flow:</strong> Pending = not yet submitted for approval. In escrow = customer approved; admin will release. Dispatched = paid to you after platform margin is deducted.
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="eyebrow">Pending</span>
          </div>
          <p className="text-2xl font-semibold text-[var(--foreground)]">₹{pendingTotal.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Milestones not yet submitted for approval</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-amber-light)]/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-[var(--accent-amber)]" />
            <span className="eyebrow">In escrow</span>
          </div>
          <p className="text-2xl font-semibold text-[var(--foreground)]">₹{heldTotal.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Customer approved; awaiting admin release</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-emerald-light)]/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-[var(--accent-emerald)]" />
            <span className="eyebrow">Dispatched to you</span>
          </div>
          <p className="text-2xl font-semibold text-[var(--foreground)]">₹{dispatchedToDesigner.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">After platform margin deducted</p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">Payment ledger</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Date, payment type, particulars, customer, amount, margin, you receive, and status.
          </p>
        </div>
        {ledger.length === 0 && pendingMilestones.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            No payments or pending milestones yet. Create milestones on a project; when the customer approves, amounts appear here as In escrow until admin releases them to you.
          </div>
        ) : (
          <>
            {pendingMilestones.length > 0 && (
              <div className="px-4 sm:px-5 py-4 bg-[var(--surface-subtle)]/50 border-b border-[var(--border)]">
                <p className="eyebrow mb-2">Pending (Not Yet Submitted for Approval)</p>
                <ul className="space-y-2">
                  {pendingMilestones.map((m, i) => (
                    <li key={`pending-${i}`} className="flex items-center justify-between gap-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{m.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">Project: {m.project_title}</p>
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">₹{m.amount.toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ledger.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                      <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Payment type</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Particulars</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">From customer</th>
                      <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Amount</th>
                      <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Margin</th>
                      <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">You receive</th>
                      <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((row) => {
                      const margin = row.platform_margin_amount ?? 0;
                      const netToDesigner = row.amount - margin;
                      return (
                        <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-3 px-4 text-[var(--foreground)]">{new Date(row.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{paymentTypeLabel(row.type)}</td>
                          <td className="py-3 px-4 text-[var(--text-muted)]">
                            {row.project_title && row.milestone_title
                              ? `${row.project_title} / ${row.milestone_title}`
                              : row.milestone_title ?? row.project_title ?? "—"}
                          </td>
                          <td className="py-3 px-4">{row.customer_name ?? row.customer_email ?? "—"}</td>
                          <td className="py-3 px-4 text-right font-medium">₹{row.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{row.type === "MILESTONE" ? (margin > 0 ? `₹${margin.toLocaleString()}` : "—") : "—"}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            {row.status === "RELEASED" ? `₹${netToDesigner.toLocaleString()}` : "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={
                                row.status === "HELD"
                                  ? "rounded-full bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] px-2.5 py-1 text-xs font-medium"
                                  : "rounded-full bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)] px-2.5 py-1 text-xs font-medium"
                              }
                            >
                              {row.status === "HELD" ? "In escrow" : "Dispatched"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
