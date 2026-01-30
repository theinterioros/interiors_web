import { CreditCard, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { RoleValues } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomerPaymentsPage() {
  await requireRole([RoleValues.CUSTOMER]);

  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-500">
            <CreditCard className="h-4 w-4 text-amber-600" />
            Payments & Escrow
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Milestone-based payments</h1>
          <p className="text-sm text-neutral-600">
            Release payments only after milestone approvals. This is a mock escrow ledger.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {[
              { title: "Design Finalization", amount: "₹1.2L", status: "Pending approval" },
              { title: "Manufacturing", amount: "₹3.4L", status: "In progress" },
              { title: "Site Execution", amount: "₹4.1L", status: "Upcoming" },
            ].map((milestone) => (
              <div key={milestone.title} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{milestone.title}</p>
                    <p className="text-xs text-neutral-500">{milestone.status}</p>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">{milestone.amount}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700">
                    Approve
                  </button>
                  <button className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500">
                    Pay now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Payment history
            </div>
            <div className="mt-4 space-y-3 text-sm text-neutral-600">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                ₹50k • Advance paid • 12 Jan
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                ₹1.2L • Design approved • 18 Jan
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                ₹0 • Escrow hold • 25 Jan
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
