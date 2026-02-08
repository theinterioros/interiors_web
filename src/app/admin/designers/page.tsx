import { approveFirmAction, rejectFirmAction, sendFirmPaymentNudgeAction } from "@/app/actions/admin";
import { BadgeCheck, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";
import PageTabs from "@/components/ui/PageTabs";
import MarginRequestApproveForm from "@/app/admin/margin-requests/MarginRequestApproveForm";
import MarginRequestRejectForm from "@/app/admin/margin-requests/MarginRequestRejectForm";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ status?: string }> };

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "MARGIN_APPROVAL", label: "Margin Approval" },
  { value: "PENDING_REGISTRATION", label: "Pending Subscription" },
  { value: "PENDING", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

type DesignerRow = {
  user_id: string;
  email: string;
  name: string | null;
  profile_id: string | null;
  firm_name: string | null;
  profile_name: string | null;
  city: string | null;
  pincode: string | null;
  experience_years: number | null;
  about: string | null;
  status: string | null;
  margin_accepted_at: Date | null;
  project_count: string;
  customer_names: string | null;
  has_paid_registration: boolean;
};

type MarginRow = {
  id: string;
  profile_id: string;
  requested_margin_pct: number;
  status: string;
  admin_comment: string | null;
  created_at: Date;
  firm_name: string | null;
  profile_name: string | null;
  user_email: string;
};

export default async function AdminDesignersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterStatus = params?.status ?? "";

  let pendingMarginCount = 0;
  let pendingMarginRows: MarginRow[] = [];
  try {
    const [countRow] = await sql<{ count: string }>`select count(*)::text as count from margin_requests where status = 'PENDING'`;
    pendingMarginCount = parseInt(countRow?.count ?? "0", 10);
    if (filterStatus === "MARGIN_APPROVAL") {
      pendingMarginRows = await sql<MarginRow>`
        select mr.id, mr.profile_id, mr.requested_margin_pct, mr.status, mr.admin_comment, mr.created_at,
               fp.firm_name, fp.name as profile_name, u.email as user_email
        from margin_requests mr
        join firm_profiles fp on fp.id = mr.profile_id
        join users u on u.id = fp.user_id
        where mr.status = 'PENDING'
        order by mr.created_at asc
      `;
    }
  } catch {
    // margin_requests table may not exist
  }

  const all = await sql<DesignerRow>`
    select
      u.id as user_id,
      u.email,
      u.name,
      fp.id as profile_id,
      fp.firm_name,
      fp.name as profile_name,
      fp.city,
      fp.pincode,
      fp.experience_years,
      fp.about,
      fp.status,
      fp.margin_accepted_at,
      (select count(*)::text from projects p where p.firm_id = u.id) as project_count,
      (select string_agg(distinct cu.name, ', ') from projects p join users cu on cu.id = p.customer_id where p.firm_id = u.id) as customer_names,
      (exists (select 1 from payment_ledger pl where pl.firm_id = u.id and pl.type = 'FIRM_REGISTRATION_FEE' and pl.status = 'RELEASED')) as has_paid_registration
    from users u
    left join firm_profiles fp on fp.user_id = u.id
    where u.role = 'FIRM'
    order by fp.status asc nulls last, u.created_at desc
  `;

  const counts = {
    all: all.length,
    MARGIN_APPROVAL: pendingMarginCount,
    PENDING_REGISTRATION: all.filter((p) => !p.has_paid_registration).length,
    PENDING: all.filter((p) => p.status === "PENDING").length,
    APPROVED: all.filter((p) => p.status === "APPROVED").length,
    REJECTED: all.filter((p) => p.status === "REJECTED").length,
  };

  const filtered =
    filterStatus === "MARGIN_APPROVAL"
      ? []
      : filterStatus === "PENDING_REGISTRATION"
        ? all.filter((p) => !p.has_paid_registration)
        : filterStatus
          ? all.filter((p) => p.status === filterStatus)
          : all;

  const tabs = STATUS_TABS.map((s) => ({
    label: s.label,
    href: s.value ? `/admin/designers?status=${s.value}` : "/admin/designers",
    active: (filterStatus || "") === s.value,
    count: s.value === "" ? counts.all : counts[s.value as keyof typeof counts],
  }));

  return (
    <div>
      <FadeIn className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BadgeCheck className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Designer Approvals</p>
        </div>
        <h1 className="heading-lg mb-3">Review Applications</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Profile can only be approved after the designer has accepted the agreed margin (Margin approval tab) and paid the yearly subscription (₹3,000). Use tabs to filter.
        </p>
      </FadeIn>

      <PageTabs tabs={tabs} />

      {filterStatus === "MARGIN_APPROVAL" ? (
        <section>
          {pendingMarginRows.length === 0 ? (
            <div className="rounded-lg border border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--text-muted)]">
              No margin requests pending. Designers submit margin from their dashboard after profile approval.
            </div>
          ) : (
            <ul className="space-y-4">
              {pendingMarginRows.map((row) => (
                <li key={row.id} className="card">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)]">
                        {row.firm_name ?? row.profile_name ?? row.user_email}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{row.user_email}</p>
                      <p className="text-sm mt-2">
                        Requested Margin: <strong>{row.requested_margin_pct}%</strong>
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Submitted {new Date(row.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3 shrink-0">
                      <MarginRequestApproveForm requestId={row.id} requestedPct={row.requested_margin_pct} />
                      <MarginRequestRejectForm requestId={row.id} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-white p-8 text-center text-[var(--text-muted)]">
          {filterStatus === "PENDING_REGISTRATION"
            ? "No designers pending subscription."
            : filterStatus
              ? `No ${STATUS_TABS.find((s) => s.value === filterStatus)?.label.toLowerCase() ?? "designers"} yet.`
              : "No designers yet."}
        </div>
      ) : (
        <StaggerChildren className="space-y-4">
          {filtered.map((row) => (
            <FadeInItem key={row.user_id}>
              <div className="card">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="heading-md">{row.firm_name ?? row.profile_name ?? row.name ?? row.email}</h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          row.status === "APPROVED"
                            ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]"
                            : row.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : row.status === "PENDING"
                                ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                                : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                        }`}
                      >
                        {row.status === "PENDING" && <Clock className="h-3 w-3" />}
                        {row.status === "APPROVED" && <CheckCircle className="h-3 w-3" />}
                        {row.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                        {row.status ?? "No profile"}
                      </span>
                      {!row.has_paid_registration && (
                        <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]">
                          Registration Unpaid
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{row.email}</p>
                    {(row.city || row.pincode) && (
                      <p className="text-sm text-[var(--text-muted)]">
                        {[row.city, row.pincode].filter(Boolean).join(" · ")}
                        {row.experience_years != null && ` · ${row.experience_years}+ years`}
                      </p>
                    )}
                    {row.project_count !== "0" && (
                      <p className="text-sm text-[var(--foreground)]">
                        {row.project_count} project(s)
                        {row.customer_names && ` · Working with: ${row.customer_names}`}
                      </p>
                    )}
                    {row.about && (
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2">{row.about}</p>
                    )}
                  </div>
                  {!row.has_paid_registration && (
                    <form action={sendFirmPaymentNudgeAction}>
                      <input type="hidden" name="userId" value={row.user_id} />
                      <button type="submit" className="btn btn-secondary text-sm inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        Send Nudge Email
                      </button>
                    </form>
                  )}
                </div>

                {row.profile_id && row.status === "PENDING" && (
                  <>
                    {row.margin_accepted_at && row.has_paid_registration ? (
                      <div className="flex flex-wrap gap-3 items-center">
                        <form action={approveFirmAction} className="flex flex-wrap gap-3 items-end">
                          <input type="hidden" name="profileId" value={row.profile_id} />
                          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <input type="checkbox" name="addVerifiedBadge" className="rounded border-[var(--border)]" />
                            Add Verified Badge
                          </label>
                          <button type="submit" className="btn btn-primary">
                            Approve Profile
                          </button>
                        </form>
                        <form action={rejectFirmAction}>
                          <input type="hidden" name="profileId" value={row.profile_id} />
                          <button type="submit" className="btn btn-secondary">
                            Reject
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
                        Profile can be approved only after designer has accepted the agreed margin (Margin requests) and paid the yearly subscription (₹3,000).
                        {!row.margin_accepted_at && " Designer has not accepted margin yet."}
                        {row.margin_accepted_at && !row.has_paid_registration && " Designer has not paid subscription yet."}
                      </div>
                    )}
                  </>
                )}
              </div>
            </FadeInItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
