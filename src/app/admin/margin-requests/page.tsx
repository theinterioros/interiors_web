import { approveMarginRequestAction, rejectMarginRequestAction } from "@/app/actions/admin";
import { sql } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { RoleValues } from "@/lib/types";
import FadeIn from "@/components/animations/FadeIn";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import MarginRequestApproveForm from "./MarginRequestApproveForm";
import MarginRequestRejectForm from "./MarginRequestRejectForm";

export const dynamic = "force-dynamic";

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

export default async function AdminMarginRequestsPage() {
  await requireRole([RoleValues.ADMIN]);

  let pending: MarginRow[] = [];
  let recent: MarginRow[] = [];
  try {
    pending = await sql<MarginRow>`
      select mr.id, mr.profile_id, mr.requested_margin_pct, mr.status, mr.admin_comment, mr.created_at,
             fp.firm_name, fp.name as profile_name, u.email as user_email
      from margin_requests mr
      join firm_profiles fp on fp.id = mr.profile_id
      join users u on u.id = fp.user_id
      where mr.status = 'PENDING'
      order by mr.created_at asc
    `;
    recent = await sql<MarginRow>`
      select mr.id, mr.profile_id, mr.requested_margin_pct, mr.status, mr.admin_comment, mr.created_at,
             fp.firm_name, fp.name as profile_name, u.email as user_email
      from margin_requests mr
      join firm_profiles fp on fp.id = mr.profile_id
      join users u on u.id = fp.user_id
      where mr.status != 'PENDING'
      order by mr.decided_at desc nulls last, mr.created_at desc
      limit 20
    `;
  } catch {
    // margin_requests table may not exist
  }

  return (
    <div>
      <FadeIn className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Margin requests</p>
        </div>
        <h1 className="heading-lg mb-3">Review margin requests</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Designers submit a margin % from their dashboard. Approve (optionally set final %) or reject with a comment. They can read the comment and resubmit. Full trail is kept.
        </p>
      </FadeIn>

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="heading-md mb-4">Pending ({pending.length})</h2>
          <ul className="space-y-4">
            {pending.map((row) => (
              <li key={row.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {row.firm_name ?? row.profile_name ?? row.user_email}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{row.user_email}</p>
                    <p className="text-sm mt-2">
                      Requested margin: <strong>{row.requested_margin_pct}%</strong>
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Submitted {new Date(row.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <MarginRequestApproveForm requestId={row.id} requestedPct={row.requested_margin_pct} />
                    <MarginRequestRejectForm requestId={row.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="heading-md mb-4">Recent decisions</h2>
        {recent.length === 0 && pending.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--text-muted)]">
            No margin requests yet. Designers submit margin from their dashboard after profile approval.
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No decided requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((row) => (
              <li key={row.id} className="rounded-lg border border-[var(--border)] bg-white p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {row.firm_name ?? row.profile_name ?? row.user_email}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {row.requested_margin_pct}% → {row.status}
                    {row.admin_comment && ` · ${row.admin_comment}`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    row.status === "APPROVED"
                      ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.status === "APPROVED" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
