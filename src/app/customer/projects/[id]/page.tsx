import { approveMilestoneAction } from "@/app/actions/project";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CustomerProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const project = await prisma.project.findFirst({
    where: { id: params.id, customerId: user.id },
    include: {
      designer: true,
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
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Project View</p>
          <h1 className="text-3xl font-semibold text-neutral-900">{project.title}</h1>
          <p className="text-sm text-neutral-500">
            Designer: {project.designer.name ?? "Designer"} • Status: {project.status}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Milestones</h2>
          {project.milestones.length === 0 ? (
            <p className="text-sm text-neutral-500">No milestones yet.</p>
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
                    <div className="mt-4 grid gap-2 md:grid-cols-2">
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
                  {milestone.status === "SUBMITTED" && (
                    <form action={approveMilestoneAction} className="mt-4">
                      <input type="hidden" name="milestoneId" value={milestone.id} />
                      <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
                        Approve milestone
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
