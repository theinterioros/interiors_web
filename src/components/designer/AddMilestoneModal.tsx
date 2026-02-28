"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect, useState, type FormEvent } from "react";
import { Plus, Loader2, X } from "lucide-react";

type Props = {
  projectId: string;
  action: (formData: FormData) => Promise<void>;
};

export default function AddMilestoneModal({ projectId, action }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setError(null);
      formRef.current?.reset();
    }
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setSubmitting(true);
    try {
      await action(formData);
      setOpen(false);
      router.push(`/designer/projects/${projectId}?tab=in-progress`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-[var(--brand)]/40 bg-[var(--brand)]/5 hover:bg-[var(--brand)]/10 transition-colors p-5 flex items-center gap-4 text-left"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white">
          <Plus className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-[var(--foreground)] block">Add milestone</span>
          <span className="text-sm text-[var(--text-muted)]">Title, amount (₹), and description. One stage = one payment.</span>
        </div>
        <span className="text-[var(--brand)] text-sm font-medium shrink-0">Open form</span>
      </button>

      {!open ? null : (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-milestone-title"
      onClick={() => setOpen(false)}
    >
      <div
        className="card w-full max-w-lg shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="add-milestone-title" className="heading-md mb-1 pr-10">
          Add milestone
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Title, amount (₹), and description. One stage = one payment.
        </p>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input type="hidden" name="projectId" value={projectId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Milestone title
              </label>
              <input
                name="title"
                required
                className="input"
                placeholder="e.g. Concept Design"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Amount (₹)
              </label>
              <input
                name="amount"
                type="number"
                min={0}
                required
                className="input"
                placeholder="65000"
                disabled={submitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              className="input"
              placeholder="What this stage includes"
              disabled={submitting}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add milestone
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
      )}
    </>
  );
}
