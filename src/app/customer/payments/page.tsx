import { CreditCard, ShieldCheck, Info } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import { paymentTypeLabel } from "@/lib/paymentLabels";

export const dynamic = "force-dynamic";

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

export default async function CustomerPaymentsPage() {
  const user = await requireCustomerPaid();

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

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Payments</p>
        </div>
        <h1 className="heading-lg mb-1">Payment history</h1>
        <p className="text-sm text-[var(--text-muted)] mb-2">
          View all your payments: registration fee, project fees, and milestone payouts. Each entry shows the date, type, project and milestone details, the designer you paid, amount, and status.
        </p>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]/50 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-[var(--brand)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--text-muted)]">
            <strong className="text-[var(--foreground)]">Escrow:</strong> When you approve a milestone, the amount is held in escrow until admin releases it to the designer. &quot;In escrow&quot; = awaiting release; &quot;Released&quot; = designer has been paid.
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-amber-light)]/20 p-5">
          <p className="eyebrow mb-1">In escrow (HELD)</p>
          <p className="text-2xl font-semibold text-[var(--foreground)]">₹{heldTotal.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">You approved; not yet released to designer (admin will release)</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-white p-5">
          <p className="eyebrow mb-1">Released</p>
          <p className="text-2xl font-semibold text-[var(--foreground)]">₹{releasedTotal.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Already sent to designer (registration + milestones)</p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Payment ledger</h2>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Date, payment type, particulars, designer, amount, and status for each payment.
          </p>
        </div>
        {ledger.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            No payments recorded yet. Registration and project fees appear here when paid. Approved milestones show as &quot;In escrow&quot; until released to the designer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                {ledger.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 px-4 text-[var(--foreground)]">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{paymentTypeLabel(row.type)}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {row.project_title && row.milestone_title
                        ? `${row.project_title} / ${row.milestone_title}`
                        : row.milestone_title ?? row.project_title ?? "—"}
                    </td>
                    <td className="py-3 px-4">{row.firm_name ?? row.firm_email ?? "—"}</td>
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
