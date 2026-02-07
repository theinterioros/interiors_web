"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

type Props = {
  platformMarginPct?: number | null;
  acceptMarginAction: () => Promise<void>;
};

export default function AcceptMarginBanner({ platformMarginPct, acceptMarginAction }: Props) {
  const [loading, setLoading] = useState(false);
  const [negotiateMsg, setNegotiateMsg] = useState(false);

  async function handleAccept() {
    setLoading(true);
    try {
      await acceptMarginAction();
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card border-[var(--brand)]/40 bg-[var(--brand-light)]/20">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--foreground)] mb-1">Accept platform margin</h3>
          <p className="text-sm text-[var(--text-muted)] mb-3">
            Admin has approved your profile with a platform margin of{" "}
            <strong>{platformMarginPct != null ? `${platformMarginPct}%` : "—"}</strong>.
            You must accept to go live and receive customer requests.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAccept}
              disabled={loading}
              className="btn btn-primary text-sm"
            >
              {loading ? "Accepting…" : "ACCEPT"}
            </button>
            <button
              type="button"
              onClick={() => setNegotiateMsg(true)}
              className="btn btn-secondary text-sm"
            >
              NEGOTIATE
            </button>
          </div>
          {negotiateMsg && (
            <p className="text-sm text-[var(--text-muted)] mt-3">
              To negotiate the margin, contact the admin from your dashboard or via support.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
