"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { rejectMilestoneAction } from "@/app/actions/project";

type Props = {
  milestoneId: string;
  milestoneTitle: string;
};

export default function RejectMilestoneForm({ milestoneId, milestoneTitle }: Props) {
  const router = useRouter();
  const [showReason, setShowReason] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await rejectMilestoneAction(formData);
      router.refresh();
      setShowReason(false);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to reject.");
    } finally {
      setPending(false);
    }
  }

  if (!showReason) {
    return (
      <button
        type="button"
        onClick={() => setShowReason(true)}
        className="btn btn-secondary cursor-pointer"
      >
        Reject & send back
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
      <input type="hidden" name="milestoneId" value={milestoneId} />
      <label className="text-sm font-medium text-[var(--foreground)]">
        Reason (optional)
      </label>
      <textarea
        name="reason"
        rows={2}
        className="input w-full text-sm"
        placeholder="e.g. Please update the finish as discussed"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-secondary text-sm inline-flex items-center justify-center gap-2"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            "Confirm reject"
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowReason(false)}
          className="btn btn-ghost text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
