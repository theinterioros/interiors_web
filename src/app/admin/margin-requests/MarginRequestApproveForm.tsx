"use client";

import { useState } from "react";
import { approveMarginRequestAction } from "@/app/actions/admin";
import { CheckCircle } from "lucide-react";

type Props = { requestId: string; requestedPct: number };

export default function MarginRequestApproveForm({ requestId, requestedPct }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await approveMarginRequestAction(formData);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--text-muted)]">Final % (optional)</span>
        <input
          type="number"
          name="adminSetMarginPct"
          min={0}
          max={100}
          step={0.5}
          placeholder={String(requestedPct)}
          className="input w-20"
        />
      </label>
      <button type="submit" disabled={loading} className="btn btn-primary text-sm inline-flex items-center gap-1">
        <CheckCircle className="h-3.5 w-3.5" />
        {loading ? "Approving…" : "Approve"}
      </button>
    </form>
  );
}
