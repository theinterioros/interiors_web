import { holdPaymentAction } from "@/app/actions/admin";
import { CreditCard, TrendingUp, Wallet, History, Lock, AlertCircle } from "lucide-react";
import { sql } from "@/lib/db";
import { paymentTypeLabel } from "@/lib/paymentLabels";
import FadeIn from "@/components/animations/FadeIn";
import PageTabs from "@/components/ui/PageTabs";
import TableFilterBar from "@/components/ui/TableFilterBar";
import ReleasePaymentButton from "@/components/admin/ReleasePaymentButton";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ status?: string; q?: string }> };

function matchSearch(row: PaymentRow, q: string): boolean {
  const s = q.toLowerCase();
  return (
    (row.project_title ?? "").toLowerCase().includes(s) ||
    (row.milestone_title ?? "").toLowerCase().includes(s) ||
    (row.customer_name ?? "").toLowerCase().includes(s) ||
    (row.customer_email ?? "").toLowerCase().includes(s) ||
    (row.firm_name ?? "").toLowerCase().includes(s) ||
    (row.firm_email ?? "").toLowerCase().includes(s)
  );
}

type PaymentRow = {
  id: string;
  type: string;
  status: string;
  amount: number;
  platform_margin_amount: number | null;
  platform_margin_pct: number | null;
  project_id: string | null;
  project_title: string | null;
  milestone_id: string | null;
  milestone_title: string | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  firm_id: string | null;
  firm_name: string | null;
  firm_email: string | null;
  created_at: Date;
};

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterStatus = params?.status ?? "";
  const q = (params?.q ?? "").trim();

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

  const payments = await sql<PaymentRow>`
    select
      p.id, p.type, p.status, p.amount, p.platform_margin_amount,
      fp.platform_margin_pct,
      p.project_id, pr.title as project_title,
      p.milestone_id, m.title as milestone_title,
      p.customer_id, cu.name as customer_name, cu.email as customer_email,
      p.firm_id, fu.name as firm_name, fu.email as firm_email,
      p.created_at
    from payment_ledger p
    left join projects pr on pr.id = p.project_id
    left join milestones m on m.id = p.milestone_id
    left join users cu on cu.id = p.customer_id
    left join users fu on fu.id = p.firm_id
    left join firm_profiles fp on fp.user_id = p.firm_id
    order by p.status asc, p.created_at desc
  `;

  const subscriptionTotal = parseInt(subscriptionRow?.total ?? "0", 10);
  const commissionTotal = parseInt(commissionRow?.total ?? "0", 10);
  const escrowTotal = parseInt(escrowRow?.total ?? "0", 10);
  const heldPayments = payments.filter((p) => p.status === "HELD");
  const releasedPayments = payments.filter((p) => p.status === "RELEASED");

  const statusFiltered =
    filterStatus === "HELD"
      ? heldPayments
      : filterStatus === "RELEASED"
        ? releasedPayments
        : payments;

  const ledgerFiltered = q ? statusFiltered.filter((row) => matchSearch(row, q)) : statusFiltered;

  const base = "/admin/payments";
  const query = (status: string) => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return s ? `?${s}` : "";
  };
  const ledgerTabs = [
    { label: "All", href: base + query(""), active: !filterStatus, count: payments.length },
    { label: "Held", href: base + query("HELD"), active: filterStatus === "HELD", count: heldPayments.length },
    { label: "Released", href: base + query("RELEASED"), active: filterStatus === "RELEASED", count: releasedPayments.length },
  ];

  return (
    <div>
      <FadeIn className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Payments</p>
        </div>
        <h1 className="heading-lg mb-3">Payment Control</h1>
        <p className="text-sm text-[var(--text-muted)] max-w-2xl">
          Release milestone payouts from escrow to designers (platform margin is deducted at release). Designers who have not paid the yearly subscription (₹3,000/year) are under Admin → Designer approvals → Pending subscription.
        </p>
      </FadeIn>

      <>
          <FadeIn delay={0.05} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-[var(--brand)]" />
                <span className="eyebrow">Subscription revenue</span>
              </div>
              <p className="heading-md">₹{subscriptionTotal.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Customer + additional project fees (RELEASED)</p>
            </div>
            <div className="card border-[var(--accent-amber)]/40">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-[var(--accent-amber)]" />
                <span className="eyebrow">In escrow (HELD)</span>
              </div>
              <p className="heading-md">₹{escrowTotal.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Customer approved; release below to pay designer</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-[var(--brand)]" />
                <span className="eyebrow">Platform commissions</span>
              </div>
              <p className="heading-md">₹{commissionTotal.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Margin deducted when releasing milestone payouts</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-4 w-4 text-[var(--brand)]" />
                <span className="eyebrow">Released to designers</span>
              </div>
              <p className="text-sm text-[var(--foreground)] font-medium">{releasedPayments.filter((p) => p.firm_id != null).length} payouts</p>
              <p className="text-xs text-[var(--text-muted)]">In ledger below</p>
            </div>
          </FadeIn>

          {heldPayments.length > 0 && (
            <FadeIn delay={0.1} className="mb-8">
              <div className="rounded-lg border-2 border-[var(--accent-amber)]/50 bg-[var(--accent-amber-light)]/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2 bg-[var(--accent-amber)]/10">
                  <AlertCircle className="h-4 w-4 text-[var(--accent-amber)]" />
                  <h2 className="font-semibold text-[var(--foreground)]">Awaiting your action: release to designer</h2>
                </div>
                <p className="px-4 py-2 text-sm text-[var(--text-muted)] border-b border-[var(--border)]">
                  Customer has approved these milestone payments. Click &quot;Release to designer&quot; to confirm and send the amount (platform margin is deducted). Designer and customer are notified.
                </p>
                <div className="table-wrap overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Particulars</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Designer</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Amount</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Margin</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {heldPayments.map((payment) => {
                        const expectedMargin =
                          payment.type === "MILESTONE" && payment.firm_id
                            ? Math.round((payment.amount * (payment.platform_margin_pct ?? 5)) / 100)
                            : null;
                        const designerName = payment.firm_name ?? payment.firm_email ?? "—";
                        return (
                          <tr key={payment.id} className="border-b border-[var(--border)]">
                            <td className="py-3 px-4 text-[var(--foreground)]">{new Date(payment.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4">{paymentTypeLabel(payment.type)}</td>
                            <td className="py-3 px-4 text-[var(--text-muted)]">
                              {payment.project_title && payment.milestone_title
                                ? `${payment.project_title} / ${payment.milestone_title}`
                                : payment.milestone_title ?? payment.project_title ?? "—"}
                            </td>
                            <td className="py-3 px-4">{payment.customer_name ?? payment.customer_email ?? "—"}</td>
                            <td className="py-3 px-4">{designerName}</td>
                            <td className="py-3 px-4 text-right font-medium">₹{payment.amount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right">{expectedMargin != null ? `₹${expectedMargin.toLocaleString()}` : "—"}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <form action={holdPaymentAction} className="inline">
                                  <input type="hidden" name="paymentId" value={payment.id} />
                                  <button type="submit" className="btn btn-ghost text-xs text-[var(--text-muted)]">
                                    Keep held
                                  </button>
                                </form>
                                <ReleasePaymentButton
                                  paymentId={payment.id}
                                  amount={payment.amount}
                                  designerName={designerName}
                                  expectedMargin={expectedMargin}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.15} className="mb-8">
            <h2 className="heading-md mb-2">Payment ledger</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              All payments with date, type, particulars, customer, designer, amount, and margin.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4">
              <PageTabs tabs={ledgerTabs} className="mb-0 sm:flex-1 sm:min-w-0 order-2 sm:order-1" />
              <div className="w-full sm:w-auto order-1 sm:order-2">
                <TableFilterBar
                  value={q}
                  placeholder="Search by project, customer, designer…"
                  preserveParams={filterStatus ? { status: filterStatus } : {}}
                />
              </div>
            </div>
            {ledgerFiltered.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                {q
                  ? "No payments match your search. Try a different term or clear the search."
                  : filterStatus
                    ? `No ${filterStatus.toLowerCase()} payments.`
                    : "No payments recorded yet."}
              </p>
            ) : (
              <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
                <div className="table-wrap overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Payment type</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Particulars</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Designer</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Amount</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Margin</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerFiltered.map((payment) => {
                        const margin =
                          payment.platform_margin_amount ??
                          (payment.type === "MILESTONE" && payment.firm_id
                            ? Math.round((payment.amount * (payment.platform_margin_pct ?? 5)) / 100)
                            : null);
                        const designerName = payment.firm_name ?? payment.firm_email ?? "—";
                        return (
                          <tr key={payment.id} className="border-b border-[var(--border)] last:border-0">
                            <td className="py-3 px-4 text-[var(--foreground)]">{new Date(payment.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4">{paymentTypeLabel(payment.type)}</td>
                            <td className="py-3 px-4 text-[var(--text-muted)]">
                              {payment.project_title && payment.milestone_title
                                ? `${payment.project_title} / ${payment.milestone_title}`
                                : payment.milestone_title ?? payment.project_title ?? "—"}
                            </td>
                            <td className="py-3 px-4">{payment.customer_name ?? payment.customer_email ?? "—"}</td>
                            <td className="py-3 px-4">{designerName}</td>
                            <td className="py-3 px-4 text-right font-medium">₹{payment.amount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right">{margin != null ? `₹${margin.toLocaleString()}` : "—"}</td>
                            <td className="py-3 px-4 text-right">
                              {payment.status === "HELD" ? (
                                <ReleasePaymentButton
                                  paymentId={payment.id}
                                  amount={payment.amount}
                                  designerName={designerName}
                                  expectedMargin={
                                    payment.type === "MILESTONE" && payment.firm_id
                                      ? Math.round((payment.amount * (payment.platform_margin_pct ?? 5)) / 100)
                                      : null
                                  }
                                />
                              ) : (
                                <span
                                  className="rounded-full bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)] px-2 py-1 text-xs font-medium"
                                >
                                  Released
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </FadeIn>
      </>
    </div>
  );
}
