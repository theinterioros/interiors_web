"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, IndianRupee, FileText } from "lucide-react";
import { submitMarginRequestAction, acceptMarginAction } from "@/app/actions/designer";
import { useState } from "react";

export type MarginRequest = {
  id: string;
  requested_margin_pct: number;
  status: string;
  admin_comment: string | null;
  created_at: Date;
};

type Props = {
  profileStatus: string;
  platformMarginPct: number | null;
  marginAcceptedAt: Date | null;
  latestRequest: MarginRequest | null;
  marginHistory: MarginRequest[];
  hasPaid: boolean;
  profileComplete: boolean;
};

export default function DashboardMarginSection({
  profileStatus,
  platformMarginPct,
  marginAcceptedAt,
  latestRequest,
  marginHistory,
  hasPaid,
  profileComplete,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canDeclare = !latestRequest || latestRequest.status === "REJECTED";
  const isPending = latestRequest?.status === "PENDING";
  const canAccept = latestRequest?.status === "APPROVED" && marginAcceptedAt == null;
  const showPayCta = marginAcceptedAt != null && !hasPaid;
  const showProfileCta = hasPaid && !profileComplete;

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitMarginRequestAction(formData);
    if (result?.error) setSubmitError(result.error);
    else router.refresh();
    setSubmitting(false);
  }

  async function handleAccept() {
    setSubmitting(true);
    try {
      await acceptMarginAction();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-[var(--brand)]" />
        <h2 className="font-semibold text-[var(--foreground)]">Platform margin</h2>
      </div>
      <div className="p-5 space-y-4">
        {profileStatus !== "APPROVED" && (
          <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
            Your profile is under review. You can submit your margin below; admin will review your profile and margin.
          </p>
        )}
        {canDeclare && (
          <>
            <p className="text-sm text-[var(--text-muted)]">
              Submit your proposed platform margin (%). Admin can approve or reject with a comment; you can resubmit after a rejection. This can go back and forth until agreed.
            </p>
            {latestRequest?.status === "REJECTED" && latestRequest.admin_comment && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">Admin comment</p>
                <p className="text-sm text-amber-900 dark:text-amber-100">{latestRequest.admin_comment}</p>
              </div>
            )}
            <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--foreground)]">Margin %</span>
                <input
                  type="number"
                  name="marginPct"
                  min={0}
                  max={100}
                  step={0.5}
                  defaultValue={latestRequest?.requested_margin_pct ?? ""}
                  className="input w-24"
                  required
                />
              </label>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? "Submitting…" : "Submit margin"}
              </button>
            </form>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          </>
        )}

        {isPending && (
          <p className="text-sm text-[var(--text-muted)]">
            Your margin request ({latestRequest.requested_margin_pct}%) is under review. Admin will approve or reject and may add a comment.
          </p>
        )}

        {canAccept && (
          <div className="rounded-md bg-[var(--brand-light)]/30 border border-[var(--brand)]/40 p-4">
            <p className="text-sm text-[var(--foreground)] mb-2">
              Admin has approved a platform margin of <strong>{platformMarginPct != null ? `${platformMarginPct}%` : "—"}</strong>.
              Accept to proceed to the subscription payment. After you pay, admin can approve your profile (this is done annually).
            </p>
            <button type="button" onClick={handleAccept} disabled={submitting} className="btn btn-primary">
              {submitting ? "Accepting…" : "Accept margin"}
            </button>
          </div>
        )}

        {showPayCta && (
          <div className="rounded-md bg-[var(--brand-light)]/30 border border-[var(--brand)]/40 p-4">
            <p className="text-sm text-[var(--foreground)] mb-2">
              Pay the yearly registration fee (₹3,000) to be listed and receive customer requests.
            </p>
            <Link href="/firm/register/pay" className="btn btn-primary inline-flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Pay ₹3,000
            </Link>
          </div>
        )}

        {showProfileCta && (
          <div className="rounded-md bg-[var(--surface-subtle)] border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--foreground)] mb-2">
              Add your profile details so customers can see your firm and portfolio.
            </p>
            <Link href="/firm/profile" className="btn btn-secondary inline-flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Add profile details
            </Link>
          </div>
        )}

        {hasPaid && profileComplete && marginAcceptedAt && (
          <p className="text-sm text-[var(--text-muted)]">
            Margin accepted. You are listed and can receive leads. Update your profile anytime from the profile page.
          </p>
        )}

        {marginHistory.length > 0 && (
          <details className="text-sm border border-[var(--border)] rounded-md">
            <summary className="px-3 py-2 cursor-pointer font-medium text-[var(--foreground)]">
              Margin history ({marginHistory.length} request{marginHistory.length !== 1 ? "s" : ""})
            </summary>
            <ul className="px-3 pb-3 pt-1 space-y-2 divide-y divide-[var(--border)]">
              {marginHistory.map((r) => (
                <li key={r.id} className="pt-2 first:pt-0">
                  <span className="font-medium">{r.requested_margin_pct}%</span>
                  <span className="text-[var(--text-muted)] mx-2">·</span>
                  <span className={r.status === "APPROVED" ? "text-emerald-600" : r.status === "REJECTED" ? "text-amber-600" : "text-[var(--text-muted)]"}>
                    {r.status}
                  </span>
                  <span className="text-[var(--text-muted)] ml-2">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                  {r.admin_comment && (
                    <p className="mt-1 text-[var(--text-muted)] italic">Admin: {r.admin_comment}</p>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
