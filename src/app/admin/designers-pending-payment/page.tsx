import Link from "next/link";
import { IndianRupee, Mail } from "lucide-react";
import { sendFirmPaymentNudgeAction } from "@/app/actions/admin";
import FadeIn from "@/components/animations/FadeIn";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type PendingPaymentRow = {
  user_id: string;
  email: string;
  name: string | null;
  firm_name: string | null;
  city: string | null;
  pincode: string | null;
  status: string | null;
};

export default async function AdminDesignersPendingPaymentPage() {
  const rows = await sql<PendingPaymentRow>`
    select
      u.id as user_id,
      u.email,
      u.name,
      fp.firm_name,
      fp.city,
      fp.pincode,
      fp.status
    from users u
    left join firm_profiles fp on fp.user_id = u.id
    where u.role = 'FIRM'
      and not exists (
        select 1 from payment_ledger pl
        where pl.firm_id = u.id
          and pl.type = 'FIRM_REGISTRATION_FEE'
          and pl.status = 'RELEASED'
      )
    order by u.created_at desc
  `;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-2 mb-2">
          <IndianRupee className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Pending Subscription</p>
        </div>
        <h1 className="heading-lg mb-2">Designers pending payment</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Track firms that have not yet completed the yearly subscription payment.
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--text-muted)]">
              Total pending: <span className="font-semibold text-[var(--foreground)]">{rows.length}</span>
            </p>
            <Link href="/admin/designers?status=PENDING_REGISTRATION" className="text-sm text-[var(--brand)] hover:underline">
              Open in Designer Approvals
            </Link>
          </div>
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No designers are pending subscription payment.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.user_id}
                  className="rounded-lg border border-[var(--border)] p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">
                      {row.firm_name ?? row.name ?? row.email}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{row.email}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {[row.city, row.pincode].filter(Boolean).join(" · ") || "Location not added"}
                      {row.status ? ` · Profile: ${row.status}` : ""}
                    </p>
                  </div>
                  <form action={sendFirmPaymentNudgeAction}>
                    <input type="hidden" name="userId" value={row.user_id} />
                    <button type="submit" className="btn btn-secondary text-sm inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Send payment nudge
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
