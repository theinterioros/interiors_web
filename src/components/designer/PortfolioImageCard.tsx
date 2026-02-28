"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useTransition } from "react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { deleteFirmPortfolioFileAction, updateFirmPortfolioFileAction } from "@/app/actions/designer";

type FileRow = { id: string; blob_url: string; file_name: string };

function UpdateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] disabled:opacity-50"
      title="Save caption"
      aria-label="Save caption"
    >
      {pending ? (
        <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Pencil className="h-4 w-4" />
      )}
    </button>
  );
}

export default function PortfolioImageCard({ file }: { file: FileRow }) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(file.file_name);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm("Remove this image from your portfolio?")) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(() => {
      deleteFirmPortfolioFileAction(formData);
    });
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-[var(--surface-subtle)]/50">
        <a
          href={file.blob_url}
          target="_blank"
          rel="noreferrer"
          className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-inset"
        >
          <img
            src={file.blob_url}
            alt={file.file_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </a>
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg bg-white/90 hover:bg-white text-[var(--foreground)] shadow-sm border border-[var(--border)] hover:bg-white"
            title="Edit caption"
            aria-label="Edit caption"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <form onSubmit={handleDelete} className="inline" method="post">
            <input type="hidden" name="fileId" value={file.id} />
            <button
              type="submit"
              disabled={isPending}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 disabled:opacity-50"
              title="Delete image"
              aria-label="Delete image"
            >
              {isPending ? (
                <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
      <div className="p-3 border-t border-[var(--border)]">
        {editing ? (
          <form action={updateFirmPortfolioFileAction} className="flex gap-2">
            <input type="hidden" name="fileId" value={file.id} />
            <input
              type="text"
              name="file_name"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={50}
              placeholder="Caption (optional)"
              className="input flex-1 text-sm py-1.5"
              autoFocus
            />
            <UpdateButton />
            <button
              type="button"
              onClick={() => { setEditing(false); setCaption(file.file_name); }}
              className="btn btn-secondary text-sm py-1.5"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-2 min-h-[2rem]">
            <p className="text-sm text-[var(--foreground)] truncate" title={file.file_name}>
              {file.file_name}
            </p>
            <a
              href={file.blob_url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 p-1 rounded text-[var(--text-muted)] hover:text-[var(--brand)]"
              title="Open full size"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
