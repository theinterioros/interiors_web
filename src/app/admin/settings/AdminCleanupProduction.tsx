"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { runCleanupProductionAction } from "@/app/actions/admin";
import type { CleanupResult } from "@/lib/cleanupProduction";

export default function AdminCleanupProduction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;
    if (!confirm("Remove all users except Mira Kapoor (designer), Aarav Sharma (customer), and all admins? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    setResult(null);
  try {
    const res = await runCleanupProductionAction();
    setResult(res);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Cleanup failed");
  } finally {
    setLoading(false);
  }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/50 p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">Production cleanup</h3>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Keep only Mira Kapoor (designer), Aarav Sharma, all admins, and any customer you notified. Remove all other designers and their data.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 inline-flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Running…
          </>
        ) : (
          "Clean up database"
        )}
      </button>
      {result && (
        <p className="mt-3 text-sm text-[var(--accent-emerald)]" role="status">
          {result.message} Kept {result.kept}, removed {result.removed}.
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
