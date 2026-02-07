"use client";

import { useState } from "react";
import { rejectMarginRequestAction } from "@/app/actions/admin";
import { XCircle } from "lucide-react";

type Props = { requestId: string };

export default function MarginRequestRejectForm({ requestId }: Props) {
  const [loading, setLoading] = useState(false);
  const [showComment, setShowComment] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await rejectMarginRequestAction(formData);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  if (!showComment) {
    return (
      <button
        type="button"
        onClick={() => setShowComment(true)}
        className="btn btn-secondary text-sm inline-flex items-center gap-1"
      >
        <XCircle className="h-3.5 w-3.5" />
        Reject
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--text-muted)]">Comment (designer will see this)</span>
        <input
          type="text"
          name="adminComment"
          placeholder="e.g. We need at least 8%"
          className="input min-w-[200px]"
        />
      </label>
      <button type="submit" disabled={loading} className="btn btn-secondary text-sm inline-flex items-center gap-1">
        <XCircle className="h-3.5 w-3.5" />
        {loading ? "Rejecting…" : "Reject"}
      </button>
      <button type="button" onClick={() => setShowComment(false)} className="btn btn-ghost text-sm">
        Cancel
      </button>
    </form>
  );
}
