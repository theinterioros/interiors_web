import {
  createMilestoneAction,
  submitMilestoneAction,
  uploadMilestoneImageAction,
} from "@/app/actions/project";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DesignerProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const project = await prisma.project.findFirst({
    where: { id: params.id, designerId: user.id },
    include: {
      customer: true,
      milestones: { include: { images: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!project) {
    return (
      <div className="min-h-screen bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl text-sm text-neutral-500">Project not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Project Management</p>
          <h1 className="text-3xl font-semibold text-neutral-900">{project.title}</h1>
          <p className="text-sm text-neutral-500">
            Customer: {project.customer.name ?? project.customer.email}
          </p>
        </div>

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

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Milestones</h2>
          {project.milestones.length === 0 ? (
            <p className="text-sm text-neutral-500">No milestones created yet.</p>
          ) : (
            <div className="space-y-4">
              {project.milestones.map((milestone) => (
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
                  {milestone.images.length > 0 && (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {milestone.images.map((image) => (
                        <a
                          key={image.id}
                          href={image.blobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-neutral-200 p-3 text-xs text-neutral-600"
                        >
                          {image.fileName}
                        </a>
                      ))}
                    </div>
                  )}

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
