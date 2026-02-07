import { CreditCard, ShieldCheck } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function CustomerPaymentsPage() {
  const user = await requireCustomerPaid();

  const ledger = await sql<{
    id: string;
    type: string;
    status: string;
    amount: number;
    project_title: string | null;
    created_at: Date;
  }>`
    select p.id, p.type, p.status, p.amount, pr.title as project_title, p.created_at
    from payment_ledger p
    left join projects pr on pr.id = p.project_id
    where p.customer_id = ${user.id}
    order by p.created_at desc
  `;

  const heldTotal = ledger.filter((r) => r.status === "HELD").reduce((s, r) => s + r.amount, 0);
  const releasedTotal = ledger.filter((r) => r.status === "RELEASED").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Payment Ledger</p>
          </div>
          <h1 className="heading-lg mb-3">Your payments & escrow</h1>
          <p className="text-[var(--text-muted)]">
            Registration fees, additional project fees, and milestone payments. Held = in escrow until admin releases to designer.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="card">
            <p className="eyebrow mb-1">In escrow (held)</p>
            <p className="text-2xl font-semibold text-[var(--foreground)]">₹{heldTotal.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">Not yet released to designer</p>
          </div>
          <div className="card">
            <p className="eyebrow mb-1">Released</p>
            <p className="text-2xl font-semibold text-[var(--foreground)]">₹{releasedTotal.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">Paid out (registration + milestones)</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="heading-md">Ledger</h2>
          </div>
          {ledger.length === 0 ? (
            <div className="card text-center text-[var(--text-muted)] py-8">
              No payments recorded yet.
            </div>
          ) : (
            <StaggerChildren className="space-y-2">
              {ledger.map((row) => (
                <FadeInItem key={row.id}>
                  <div className="card flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{row.type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {row.project_title ?? "—"} · {row.status}
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
          )}
        </FadeIn>
      </div>
    </div>
  );
}
