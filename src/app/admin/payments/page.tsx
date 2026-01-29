import { holdPaymentAction, releasePaymentAction } from "@/app/actions/admin";
import { sql } from "@/lib/db";

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
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Payment Control</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Escrow ledger</h1>
          <p className="text-sm text-neutral-500">
            Mock payments only. Hold or release to simulate escrow workflows.
          </p>
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-neutral-500">No payments recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                      {payment.type}
                    </p>
                    <p className="text-lg font-semibold text-neutral-900">₹{payment.amount}</p>
                    <p className="text-xs text-neutral-500">
                      {payment.project_title ?? "General ledger"} • Status: {payment.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={holdPaymentAction}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <button className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-700">
                        Hold
                      </button>
                    </form>
                    <form action={releasePaymentAction}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <button className="rounded-md bg-black px-3 py-2 text-xs text-white">
                        Release
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
