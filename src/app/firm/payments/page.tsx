import { CreditCard, Clock, Lock, CheckCircle } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function FirmPaymentsPage() {
  const user = await requireFirmPaid();

  const [ledger, pendingMilestones] = await Promise.all([
    sql<{
      id: string;
      type: string;
      status: string;
      amount: number;
      platform_margin_amount: number | null;
      project_title: string | null;
      created_at: Date;
    }>`
      select p.id, p.type, p.status, p.amount, p.platform_margin_amount, pr.title as project_title, p.created_at
      from payment_ledger p
      left join projects pr on pr.id = p.project_id
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
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Earnings Ledger</p>
          </div>
          <h1 className="heading-lg mb-3">Money management</h1>
          <p className="text-[var(--text-muted)]">
            Three-column view: work in progress, customer-paid (in escrow), and dispatched to your bank.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="card border-[var(--border)]">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-[var(--text-muted)]" />
              <span className="eyebrow">Pending</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">₹{pendingTotal.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">Work in progress (milestones not yet submitted)</p>
          </div>
          <div className="card border-[var(--accent-amber)]/40 bg-[var(--accent-amber-light)]/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-[var(--accent-amber)]" />
              <span className="eyebrow">In escrow</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">₹{heldTotal.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">Customer paid · awaiting admin release</p>
          </div>
          <div className="card border-green-200 bg-green-50/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="eyebrow">Dispatched</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">₹{dispatchedToDesigner.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">Money in bank (after platform margin)</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <h2 className="heading-md mb-4">Ledger entries</h2>
          {ledger.length === 0 && pendingMilestones.length === 0 ? (
            <div className="card text-center text-[var(--text-muted)] py-8">
              No payments or pending milestones yet.
            </div>
          ) : (
            <div className="space-y-6">
              {pendingMilestones.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">Pending (work in progress)</p>
                  <StaggerChildren className="space-y-2">
                    {pendingMilestones.map((m, i) => (
                      <FadeInItem key={`pending-${i}`}>
                        <div className="card flex flex-wrap items-center justify-between gap-3 opacity-90">
                          <div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">{m.title}</p>
                            <p className="text-xs text-[var(--text-muted)]">{m.project_title}</p>
                          </div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">₹{m.amount.toLocaleString()}</p>
                        </div>
                      </FadeInItem>
                    ))}
                  </StaggerChildren>
                </div>
              )}
              {ledger.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">In escrow / Dispatched</p>
                  <StaggerChildren className="space-y-2">
                    {ledger.map((row) => (
                      <FadeInItem key={row.id}>
                        <div className="card flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">{row.type.replace(/_/g, " ")}</p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {row.project_title ?? "—"} · {row.status}
                              {row.platform_margin_amount != null && row.status === "RELEASED" && (
                                <> · Margin: ₹{row.platform_margin_amount.toLocaleString()}</>
                              )}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">₹{row.amount.toLocaleString()}</p>
                          <p className="text-xs text-[var(--text-muted)] w-full sm:w-auto">
                            {new Date(row.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </FadeInItem>
                    ))}
                  </StaggerChildren>
                </div>
              )}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
