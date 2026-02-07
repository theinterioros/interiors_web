import { Clock } from "lucide-react";

export type TrailEntry = {
  event: string;
  message: string | null;
  created_at: Date;
};

type Props = {
  milestoneCreatedAt: Date;
  trail: TrailEntry[];
};

function formatDate(d: Date) {
  return new Date(d).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MilestoneTimeline({ milestoneCreatedAt, trail }: Props) {
  const created = { event: "Created", message: null, created_at: milestoneCreatedAt };
  const entries = [created, ...trail].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="text-sm font-medium text-[var(--foreground)]">Timeline</span>
      </div>
      <ul className="space-y-3">
        {entries.map((e, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="text-[var(--text-muted)] shrink-0 w-28">
              {formatDate(e.created_at)}
            </span>
            <span className="text-[var(--foreground)]">
              {e.event === "Created" && "Milestone created"}
              {e.event === "SUBMITTED" && "Submitted for approval"}
              {e.event === "REJECTED" && (
                <>
                  Sent back for revision
                  {e.message ? `: ${e.message}` : ""}
                </>
              )}
              {e.event === "APPROVED" && "Approved & paid"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
