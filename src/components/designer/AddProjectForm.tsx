import { createPortfolioProjectWithImagesAction } from "@/app/actions/designer";
import { ImagePlus } from "lucide-react";

type Props = { canAddMore: boolean; nextLabel: string };

export default function AddProjectForm({ canAddMore, nextLabel }: Props) {
  if (!canAddMore) return null;

  return (
    <div className="rounded-xl border-2 border-dashed border-[var(--brand)]/40 bg-[var(--brand)]/5 p-6">
      <h3 className="font-semibold text-[var(--foreground)] mb-1">{nextLabel}</h3>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        Add project name, description, and up to 5 images (upload or paste image link with a name for each). Customers will see this in your portfolio.
      </p>

      <form action={createPortfolioProjectWithImagesAction} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Project name *</label>
          <input name="title" placeholder="e.g. Living room makeover" className="input w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description</label>
          <textarea name="description" rows={2} placeholder="Brief description of the project" className="input w-full" />
        </div>

        <div className="pt-3 border-t border-[var(--border)]">
          <p className="text-sm font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            Images (optional, up to 5)
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-4">For each image: upload a file or paste an image URL, and add a short name/caption.</p>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-white/50 p-3 space-y-2">
                <p className="text-xs font-medium text-[var(--text-muted)]">Image {i}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Upload or URL</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        name={`image_${i}_file`}
                        accept="image/*"
                        className="input flex-1 text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[var(--brand)] file:text-white"
                      />
                      <span className="self-center text-[var(--text-muted)] text-xs">or</span>
                      <input
                        type="url"
                        name={`image_${i}_url`}
                        placeholder="https://..."
                        className="input flex-1 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Image name / caption</label>
                    <input
                      type="text"
                      name={`image_${i}_name`}
                      maxLength={50}
                      placeholder="e.g. Living area view"
                      className="input w-full text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Add project
        </button>
      </form>
    </div>
  );
}
