import { holdPaymentAction, releasePaymentAction } from "@/app/actions/admin";
import { CreditCard, TrendingUp, Wallet, History, Lock } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const [subscriptionRow] = await sql<{ total: string }>`
    select coalesce(sum(amount), 0)::text as total from payment_ledger
    where type in ('CUSTOMER_REGISTRATION_FEE', 'ADDITIONAL_PROJECT_FEE') and status = 'RELEASED'
  `;
  const [commissionRow] = await sql<{ total: string }>`
    select coalesce(sum(platform_margin_amount), 0)::text as total from payment_ledger
    where status = 'RELEASED' and platform_margin_amount is not null
  `;
  const [escrowRow] = await sql<{ total: string }>`
    select coalesce(sum(amount), 0)::text as total from payment_ledger where status = 'HELD'
  `;
  const payoutsToDesigners = await sql<{
    id: string;
    type: string;
    amount: number;
    platform_margin_amount: number | null;
    project_title: string | null;
    created_at: Date;
  }>`
    select p.id, p.type, p.amount, p.platform_margin_amount, pr.title as project_title, p.created_at
    from payment_ledger p
    left join projects pr on pr.id = p.project_id
    where p.status = 'RELEASED' and p.firm_id is not null
    order by p.created_at desc
    limit 20
  `;

  const payments = await sql<{
    id: string;
    type: string;
    status: string;
    amount: number;
    platform_margin_amount: number | null;
    project_title: string | null;
  }>`
    select p.id, p.type, p.status, p.amount, p.platform_margin_amount, pr.title as project_title
    from payment_ledger p
    left join projects pr on pr.id = p.project_id
    order by p.created_at desc
  `;

  const subscriptionTotal = parseInt(subscriptionRow?.total ?? "0", 10);
  const commissionTotal = parseInt(commissionRow?.total ?? "0", 10);
  const escrowTotal = parseInt(escrowRow?.total ?? "0", 10);

  return (
    <div>
      <FadeIn className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Financial Ledger</p>
        </div>
        <h1 className="heading-lg mb-3">Control tower</h1>
        <p className="text-[var(--text-muted)]">
          Subscription revenue, money in escrow (not yet released), and platform commissions. Release HELD payments to designers (margin deducted).
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-[var(--brand)]" />
            <span className="eyebrow">Subscription revenue</span>
          </div>
          <p className="heading-md">₹{subscriptionTotal.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)]">(Customers × ₹1000) + (Additional projects × ₹1000)</p>
        </div>
        <div className="card border-[var(--accent-amber)]/40">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-[var(--accent-amber)]" />
            <span className="eyebrow">Money in escrow</span>
          </div>
          <p className="heading-md">₹{escrowTotal.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)]">Not yet released to designers (pending payouts)</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-[var(--brand)]" />
            <span className="eyebrow">Platform revenue (commissions)</span>
          </div>
          <p className="heading-md">₹{commissionTotal.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)]">Total milestone margins already collected</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-[var(--brand)]" />
            <span className="eyebrow">Payout history</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{payoutsToDesigners.length} recent releases</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="mb-8">
        <h2 className="heading-md mb-4">Escrow ledger</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No payments recorded yet.</p>
        ) : (
          <StaggerChildren className="space-y-4">
            {payments.map((payment) => (
              <FadeInItem key={payment.id}>
                <div className="card">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="eyebrow mb-1">{payment.type}</p>
                      <p className="heading-md mb-1">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {payment.project_title ?? "—"} • {payment.status}
                        {payment.platform_margin_amount != null && payment.status === "RELEASED" && (
                          <> • Margin: ₹{payment.platform_margin_amount.toLocaleString()}</>
                        )}
                      </p>
                    </div>
                    {payment.status === "HELD" ? (
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
                            Release to designer
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">Released</span>
                    )}
                  </div>
                </div>
              </FadeInItem>
            ))}
          </StaggerChildren>
        )}
      </FadeIn>
    </div>
  );
}
