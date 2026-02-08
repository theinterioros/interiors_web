import {
  createMilestoneAction,
  initiateProjectAction,
  submitMilestoneAction,
  uploadMilestoneImageAction,
  updateMilestoneDescriptionAction,
} from "@/app/actions/project";
import AddMilestonePhotoForm from "@/components/firm/AddMilestonePhotoForm";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DesignerProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireFirmPaid();

  const [project] = await sql<{
    id: string;
    title: string;
    status: string;
    customer_name: string | null;
    customer_email: string;
  }>`
    select p.id, p.title, p.status, u.name as customer_name, u.email as customer_email
    from projects p
    join users u on u.id = p.customer_id
    where p.id = ${id} and p.firm_id = ${user.id}
    limit 1
  `;

  if (!project) {
    return (
      <div className="min-h-screen bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl text-sm text-neutral-500">Project not found.</div>
      </div>
    );
  }

  const milestones = await sql<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: string;
  }>`
    select id, title, description, amount, status
    from milestones
    where project_id = ${project.id}
    order by created_at asc
  `;

  const milestoneIds = milestones.map((milestone) => milestone.id);
  const images = milestoneIds.length
    ? await sql<{
        id: string;
        milestone_id: string;
        blob_url: string;
        file_name: string;
      }>`
        select id, milestone_id, blob_url, file_name
        from milestone_images
        where milestone_id = any(${milestoneIds})
        order by created_at asc
      `
    : [];

  const imagesByMilestone = images.reduce<Record<string, typeof images>>((acc, image) => {
    if (!acc[image.milestone_id]) acc[image.milestone_id] = [];
    acc[image.milestone_id].push(image);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Project Management</p>
          <h1 className="text-3xl font-semibold text-neutral-900">{project.title}</h1>
          <p className="text-sm text-neutral-500">
            Customer: {project.customer_name ?? project.customer_email} • Status: {project.status}
          </p>
        </div>

        {(project.status === "LEAD" || project.status === "ACCEPTED") && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-neutral-700">
            {project.status === "LEAD"
              ? "Lead. After the meetup, click Initiate project below to move to Active and add milestones."
              : "Accepted. Click Initiate project below to move to Active and add milestones."}
            <form action={initiateProjectAction} className="mt-3">
              <input type="hidden" name="projectId" value={project.id} />
              <button type="submit" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
                Initiate project
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Milestones</h2>
          <p className="text-sm text-neutral-500">
            Add payment stages, attach 1–3 photos per stage as evidence, then submit for approval. Customer approves and pays; admin releases funds to you.
          </p>

          {project.status === "ACTIVE" ? (
            <details className="rounded-2xl border border-neutral-200 p-4 group">
              <summary className="cursor-pointer list-none font-medium text-neutral-900">
                Create milestone
              </summary>
              <form action={createMilestoneAction} className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
                <input type="hidden" name="projectId" value={project.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Milestone title</label>
                    <input name="title" required className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" placeholder="e.g. Concept Design" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Amount (INR)</label>
                    <input name="amount" type="number" min={0} required className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" placeholder="65000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Description</label>
                  <textarea name="description" rows={2} className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" placeholder="What this stage includes" />
                </div>
                <button type="submit" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
                  Add milestone
                </button>
              </form>
            </details>
          ) : (
            <div className="rounded-2xl border border-neutral-200 p-6 text-sm text-neutral-500">
              Create milestones after initiating this project (status must be Active).
            </div>
          )}

          {milestones.length === 0 ? (
            <p className="text-sm text-neutral-500">No milestones yet. Use &quot;Create milestone&quot; above to add one.</p>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => {
                const evidenceCount = imagesByMilestone[milestone.id]?.length ?? 0;
                const canSubmit = evidenceCount >= 1 && evidenceCount <= 3;
                return (
                  <div key={milestone.id} className="rounded-2xl border border-neutral-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">{milestone.status}</p>
                        <h3 className="text-lg font-semibold text-neutral-900">{milestone.title}</h3>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900">₹{milestone.amount.toLocaleString()}</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-neutral-500 mb-1">Description</p>
                      {(milestone.status === "IN_PROGRESS" || milestone.status === "PENDING") ? (
                        <form action={updateMilestoneDescriptionAction}>
                          <input type="hidden" name="milestoneId" value={milestone.id} />
                          <textarea name="description" rows={2} defaultValue={milestone.description} className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" placeholder="What this stage includes" />
                          <button type="submit" className="mt-2 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-800">Save description</button>
                        </form>
                      ) : (
                        <p className="text-sm text-neutral-500">{milestone.description || "—"}</p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <p className="text-xs font-medium text-neutral-500 mb-1">Evidence — {evidenceCount} of 3 photos</p>
                      <p className="text-xs text-neutral-500 mb-2">Add 1–3 photos for the customer to review, then submit for approval.</p>
                      {evidenceCount > 0 && (
                        <div className="grid gap-2 md:grid-cols-2 mb-3">
                          {imagesByMilestone[milestone.id].map((image) => (
                            <a key={image.id} href={image.blob_url} target="_blank" rel="noreferrer" className="rounded-lg border border-neutral-200 p-3 text-xs text-neutral-600 hover:underline">
                              {image.file_name}
                            </a>
                          ))}
                        </div>
                      )}
                      {(milestone.status === "PENDING" || milestone.status === "IN_PROGRESS") && evidenceCount < 3 && (
                        <div className="mb-3">
                          <AddMilestonePhotoForm
                            milestoneId={milestone.id}
                            action={uploadMilestoneImageAction}
                            buttonClassName="rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-800"
                          />
                        </div>
                      )}
                      {(milestone.status === "PENDING" || milestone.status === "IN_PROGRESS") && (
                        canSubmit ? (
                          <form action={submitMilestoneAction} className="inline">
                            <input type="hidden" name="milestoneId" value={milestone.id} />
                            <button type="submit" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
                              Submit for approval
                            </button>
                          </form>
                        ) : (
                          <p className="text-xs text-amber-600">Add at least 1 photo (max 3) to submit this stage.</p>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
