"use client";

import { Trash2 } from "lucide-react";
import { deletePortfolioWorkAction } from "@/app/actions/designer";

type Props = { workId: string };

export default function DeleteProjectButton({ workId }: Props) {
  return (
    <form
      action={deletePortfolioWorkAction}
      method="post"
      className="inline"
      onSubmit={(e) => {
        if (!confirm("Remove this project and all its images from your portfolio?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="workId" value={workId} />
      <button
        type="submit"
        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        title="Delete project"
        aria-label="Delete project"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
