"use client";

import { useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";

const MAX_IMAGES = 5;

type Props = {
  canAddMore: boolean;
  nextLabel: string;
  action: (formData: FormData) => Promise<void>;
};

export default function AddProjectModal({ canAddMore, nextLabel, action }: Props) {
  const [open, setOpen] = useState(false);
  const [imageSlots, setImageSlots] = useState(1);

  if (!canAddMore) return null;

  function addImageSlot() {
    setImageSlots((n) => Math.min(n + 1, MAX_IMAGES));
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
          <span className="font-semibold text-[var(--foreground)] block">{nextLabel}</span>
          <span className="text-sm text-[var(--text-muted)]">
            Add project name, description, and up to 5 images. Customers will see this in your portfolio.
          </span>
        </div>
        <span className="text-[var(--brand)] text-sm font-medium shrink-0">Open</span>
      </button>

      {!open ? null : (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-project-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-[var(--surface)] rounded-2xl shadow-xl relative my-8 w-full max-w-md border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 id="add-project-title" className="text-xl font-semibold text-[var(--foreground)] pr-10">
                {nextLabel}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Name and description are required. Images are optional.
              </p>
            </div>

            <form action={action} className="px-6 pb-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Project name</label>
                  <input
                    name="title"
                    placeholder="e.g. Living room makeover"
                    className="input w-full text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Brief description for customers"
                    className="input w-full text-sm resize-none"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--foreground)] flex items-center gap-1.5">
                      <ImagePlus className="h-4 w-4 text-[var(--text-muted)]" />
                      Images (optional)
                    </span>
                    {imageSlots < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={addImageSlot}
                        className="text-xs font-medium text-[var(--brand)] hover:underline"
                      >
                        + Add image
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: imageSlots }, (_, i) => i + 1).map((i) => (
                      <div key={i} className="flex flex-col gap-2 rounded-lg bg-[var(--surface-subtle)]/50 p-3">
                        <div className="flex gap-2 flex-wrap">
                          <input
                            type="file"
                            name={`image_${i}_file`}
                            accept="image/*"
                            className="flex-1 min-w-0 text-xs file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[var(--brand)] file:text-white file:cursor-pointer"
                          />
                          <input
                            type="url"
                            name={`image_${i}_url`}
                            placeholder="or paste URL"
                            className="input flex-1 min-w-[120px] text-sm py-2"
                          />
                        </div>
                        <input
                          type="text"
                          name={`image_${i}_name`}
                          maxLength={50}
                          placeholder="Caption (e.g. Living area)"
                          className="input w-full text-sm py-2"
                        />
                      </div>
                    ))}
                  </div>
                  {imageSlots < MAX_IMAGES && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      Up to {MAX_IMAGES} images per project. Add more with the button above.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border)]">
                <button type="submit" className="btn btn-primary flex-1">
                  Add project
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
