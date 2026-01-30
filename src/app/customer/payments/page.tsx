import { CreditCard, ShieldCheck } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function CustomerPaymentsPage() {
  await requireCustomerPaid();

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Payments & Escrow</p>
          </div>
          <h1 className="heading-lg mb-3">Milestone-based payments</h1>
          <p className="text-[var(--text-muted)]">
            Release payments only after milestone approvals. This is a mock escrow ledger.
          </p>
        </FadeIn>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <StaggerChildren className="space-y-4">
            {[
              { title: "Design Finalization", amount: "₹1.2L", status: "Pending approval" },
              { title: "Manufacturing", amount: "₹3.4L", status: "In progress" },
              { title: "Site Execution", amount: "₹4.1L", status: "Upcoming" },
            ].map((milestone) => (
              <FadeInItem key={milestone.title}>
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{milestone.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{milestone.status}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{milestone.amount}</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="btn btn-secondary text-xs">Approve</button>
                    <button className="btn btn-primary text-xs">Pay now</button>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </StaggerChildren>

          <FadeIn delay={0.3}>
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
                <p className="eyebrow">Payment history</p>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { amount: "₹50k", desc: "Advance paid", date: "12 Jan" },
                  { amount: "₹1.2L", desc: "Design approved", date: "18 Jan" },
                  { amount: "₹0", desc: "Escrow hold", date: "25 Jan" },
                ].map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div>
                      <p className="text-[var(--foreground)] font-semibold">{item.amount}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
