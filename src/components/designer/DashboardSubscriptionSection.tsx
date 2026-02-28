"use client";

import Link from "next/link";
import { IndianRupee, FileText } from "lucide-react";

const PLATFORM_MARGIN_PCT = 5;

type Props = {
  hasPaid: boolean;
  profileComplete: boolean;
};

export default function DashboardSubscriptionSection({ hasPaid, profileComplete }: Props) {
  const showPayCta = !hasPaid;
  const showProfileCta = hasPaid && !profileComplete;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="font-semibold text-[var(--foreground)]">Subscription & profile</h2>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm text-[var(--text-muted)]">
          Platform margin is {PLATFORM_MARGIN_PCT}% on milestone payouts. Pay the yearly subscription to be listed and receive customer requests.
        </p>
        {showPayCta && (
          <div className="rounded-md bg-[var(--brand-light)]/30 border border-[var(--brand)]/40 p-4">
            <p className="text-sm text-[var(--foreground)] mb-2">
              Pay the yearly registration fee (₹3,000) to be listed and receive customer requests.
            </p>
            <Link href="/designer/register/pay" className="btn btn-primary inline-flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Pay ₹3,000
            </Link>
          </div>
        )}
        {showProfileCta && (
          <div className="rounded-md bg-[var(--surface-subtle)] border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--foreground)] mb-2">
              Add your profile details so customers can see your studio and portfolio.
            </p>
            <Link href="/designer/profile" className="btn btn-secondary inline-flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Add profile details
            </Link>
          </div>
        )}
        {hasPaid && profileComplete && (
          <p className="text-sm text-[var(--text-muted)]">
            You are listed and can receive leads. Update your profile anytime from the profile page.
          </p>
        )}
      </div>
    </div>
  );
}
