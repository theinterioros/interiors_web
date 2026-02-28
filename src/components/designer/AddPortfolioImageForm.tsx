"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Link2, Upload } from "lucide-react";

type Mode = "upload" | "link";

type Props = {
  action: (formData: FormData) => Promise<void>;
  workId: string | null;
  workOrder: number;
  maxImages: number;
  currentCount: number;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="btn btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-50"
    >
      {pending ? (
        <>
          <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
          Adding…
        </>
      ) : (
        <>
          <ImagePlus className="h-4 w-4" />
          Add image
        </>
      )}
    </button>
  );
}

export default function AddPortfolioImageForm({ action, workId, workOrder, maxImages, currentCount }: Props) {
  const [mode, setMode] = useState<Mode>("upload");
  const [error, setError] = useState("");

  const canAdd = currentCount < maxImages;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file") as File | null;
    const url = (formData.get("imageUrl") as string)?.trim() || "";

    if (mode === "upload") {
      if (!file?.size) {
        e.preventDefault();
        setError("Choose an image file to upload.");
        return;
      }
    } else {
      if (!url) {
        e.preventDefault();
        setError("Paste an image URL (e.g. from Imgur, Google Photos, or your site).");
        return;
      }
      try {
        new URL(url);
      } catch {
        e.preventDefault();
        setError("Please enter a valid URL.");
        return;
      }
    }
    // Valid: let the form submit via action
  };

  if (!canAdd) return null;

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="workOrder" value={workOrder} />
      {workId ? <input type="hidden" name="workId" value={workId} /> : null}

      <div className="flex gap-2 p-1 rounded-lg bg-[var(--surface-subtle)]/50 border border-[var(--border)]">
        <button
          type="button"
          onClick={() => { setMode("upload"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${mode === "upload" ? "bg-white text-[var(--foreground)] shadow-sm border border-[var(--border)]" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"}`}
        >
          <Upload className="h-4 w-4" />
          Upload file
        </button>
        <button
          type="button"
          onClick={() => { setMode("link"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${mode === "link" ? "bg-white text-[var(--foreground)] shadow-sm border border-[var(--border)]" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"}`}
        >
          <Link2 className="h-4 w-4" />
          Paste link
        </button>
      </div>

      {mode === "upload" ? (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">Choose image</label>
          <div className="rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-subtle)]/30 p-4 transition-colors hover:border-[var(--brand)]/50 hover:bg-[var(--surface-subtle)]/50">
            <input
              type="file"
              name="file"
              accept="image/*"
              className="block w-full text-sm text-[var(--text-muted)] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--brand)] file:text-white file:cursor-pointer hover:file:opacity-90"
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">PNG, JPG or WebP. Max 10 MB.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">Image URL</label>
          <input
            type="url"
            name="imageUrl"
            placeholder="https://example.com/photo.jpg"
            className="input w-full"
            aria-describedby="url-hint"
          />
          <p id="url-hint" className="text-xs text-[var(--text-muted)]">Paste a direct link to an image (must start with https://).</p>
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--foreground)]">Caption <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
        <input
          type="text"
          name="imageTitle"
          maxLength={50}
          placeholder="e.g. Living room — before"
          className="input w-full"
        />
        <p className="text-xs text-[var(--text-muted)]">Short title for this image, max 50 characters.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <SubmitButton disabled={false} />
    </form>
  );
}
