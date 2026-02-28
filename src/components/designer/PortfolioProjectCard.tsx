import AddPortfolioImageForm from "@/components/designer/AddPortfolioImageForm";
import PortfolioImageCard from "@/components/designer/PortfolioImageCard";
import DeleteProjectButton from "@/components/designer/DeleteProjectButton";
import { savePortfolioWorkAction, uploadFirmPortfolioAction } from "@/app/actions/designer";

type Work = { id: string; title: string; description: string | null; display_order: number };
type FileRow = { id: string; blob_url: string; file_name: string };

type Props = {
  work: Work;
  workFiles: FileRow[];
  projectNumber: number;
};

export default function PortfolioProjectCard({ work, workFiles, projectNumber }: Props) {
  const canAddMoreImages = workFiles.length < 5;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="font-semibold text-[var(--foreground)]">Project {projectNumber}</h3>
        <DeleteProjectButton workId={work.id} />
      </div>

      <form action={savePortfolioWorkAction} className="space-y-3 mb-5">
        <input type="hidden" name="workOrder" value={work.display_order} />
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Project title</label>
          <input
            name="title"
            defaultValue={work.title}
            placeholder="e.g. Living room makeover"
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={work.description ?? ""}
            placeholder="Brief description"
            className="input w-full"
          />
        </div>
        <button type="submit" className="btn btn-secondary">Save project</button>
      </form>

      <div className="pt-4 border-t border-[var(--border)]">
        <p className="text-sm font-medium text-[var(--foreground)] mb-2">Images ({workFiles.length}/5)</p>
        {canAddMoreImages && (
          <AddPortfolioImageForm
            action={uploadFirmPortfolioAction}
            workId={work.id}
            workOrder={work.display_order}
            maxImages={5}
            currentCount={workFiles.length}
          />
        )}

        {workFiles.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {workFiles.map((f) => (
                <PortfolioImageCard key={f.id} file={f} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
