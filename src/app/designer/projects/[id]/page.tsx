import {
  createMilestoneAction,
  submitMilestoneAction,
  uploadMilestoneImageAction,
} from "@/app/actions/project";
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

        {project.status === "LEAD" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-neutral-700">
            Lead. After the meetup, go to Dashboard or Leads and click &quot;Initiate Project&quot; to move this project to Active. Milestones can only be created for active projects.
          </div>
        )}

        {project.status === "ACTIVE" ? (
        <form
          action={createMilestoneAction}
          className="space-y-4 rounded-2xl border border-neutral-200 p-6"
        >
          <input type="hidden" name="projectId" value={project.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Milestone title</label>
              <input
                name="title"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Amount (INR)</label>
              <input
                name="amount"
                type="number"
                min={0}
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
            Add milestone
          </button>
        </form>
        ) : (
          <div className="rounded-2xl border border-neutral-200 p-6 text-sm text-neutral-500">
            Create milestones after initiating this project (status must be Active).
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Milestones</h2>
          {milestones.length === 0 ? (
            <p className="text-sm text-neutral-500">No milestones created yet.</p>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-2xl border border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                        {milestone.status}
                      </p>
                      <h3 className="text-lg font-semibold text-neutral-900">{milestone.title}</h3>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">₹{milestone.amount}</p>
                  </div>
                  <p className="mt-2 text-sm text-neutral-500">{milestone.description}</p>
                  {imagesByMilestone[milestone.id]?.length ? (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {imagesByMilestone[milestone.id].map((image) => (
                        <a
                          key={image.id}
                          href={image.blob_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-neutral-200 p-3 text-xs text-neutral-600"
                        >
                          {image.file_name}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={uploadMilestoneImageAction} encType="multipart/form-data">
                      <input type="hidden" name="milestoneId" value={milestone.id} />
                      <input type="file" name="file" required className="text-sm" />
                      <button className="ml-2 rounded-md border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-800">
                        Upload image
                      </button>
                    </form>
                    {milestone.status === "PENDING" && (
                      <form action={submitMilestoneAction}>
                        <input type="hidden" name="milestoneId" value={milestone.id} />
                        <button className="rounded-md bg-black px-3 py-2 text-xs font-medium text-white">
                          Request approval
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
