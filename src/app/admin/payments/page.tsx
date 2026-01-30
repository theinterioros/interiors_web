import { holdPaymentAction, releasePaymentAction } from "@/app/actions/admin";
import { CreditCard } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await sql<{
    id: string;
    type: string;
    status: string;
    amount: number;
    project_title: string | null;
  }>`
    select p.id, p.type, p.status, p.amount, pr.title as project_title
    from payment_ledger p
    left join projects pr on pr.id = p.project_id
    order by p.created_at desc
  `;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Payment Control</p>
          </div>
          <h1 className="heading-lg mb-3">Escrow ledger</h1>
          <p className="text-[var(--text-muted)]">
            Mock payments only. Hold or release to simulate escrow workflows.
          </p>
        </FadeIn>

        {payments.length === 0 ? (
          <FadeIn>
            <p className="text-sm text-[var(--text-muted)]">No payments recorded yet.</p>
          </FadeIn>
        ) : (
          <StaggerChildren className="space-y-4">
            {payments.map((payment) => (
              <FadeInItem key={payment.id}>
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow mb-1">{payment.type}</p>
                      <p className="heading-md mb-1">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {payment.project_title ?? "General ledger"} • Status: {payment.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action={holdPaymentAction}>
                        <input type="hidden" name="paymentId" value={payment.id} />
                        <button type="submit" className="btn btn-secondary text-xs">
                          Hold
                        </button>
                      </form>
                      <form action={releasePaymentAction}>
                        <input type="hidden" name="paymentId" value={payment.id} />
                        <button type="submit" className="btn btn-primary text-xs">
                          Release
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </StaggerChildren>
        )}
      </div>
    </div>
  );
}
