import { sendFirmPaymentNudgeAction } from "@/app/actions/admin";
import { IndianRupee, Mail } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function AdminFirmsPendingPaymentPage() {
  const firms = await sql<{
    user_id: string;
    email: string;
    name: string | null;
    firm_name: string | null;
  }>`
    select u.id as user_id, u.email, u.name, fp.firm_name
    from users u
    left join firm_profiles fp on fp.user_id = u.id
    where u.role = 'FIRM'
      and not exists (
        select 1 from payment_ledger p
        where p.firm_id = u.id and p.type = 'FIRM_REGISTRATION_FEE' and p.status = 'RELEASED'
      )
    order by u.created_at desc
  `;

  return (
    <div>
      <FadeIn className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Designers pending payment</p>
        </div>
        <h1 className="heading-lg mb-3">Registration fee not paid</h1>
        <p className="text-[var(--text-muted)]">
          These designers have registered but not completed the one-time ₹3,000 payment. Send a nudge email to remind them.
        </p>
      </FadeIn>

      {firms.length === 0 ? (
        <FadeIn>
          <div className="card text-center text-[var(--text-muted)]">
            No designers pending payment.
          </div>
        </FadeIn>
      ) : (
        <StaggerChildren className="space-y-4">
          {firms.map((designer) => (
            <FadeInItem key={designer.user_id}>
              <div className="card flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="heading-md mb-1">{designer.firm_name ?? designer.name ?? "—"}</h3>
                  <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {designer.email}
                  </p>
                </div>
                <form action={sendFirmPaymentNudgeAction}>
                  <input type="hidden" name="userId" value={designer.user_id} />
                  <button type="submit" className="btn btn-secondary">
                    Send nudge email
                  </button>
                </form>
              </div>
            </FadeInItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
