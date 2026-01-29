import { respondProjectRequestAction } from "@/app/actions/project";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DesignerLeadsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const leads = await prisma.project.findMany({
    where: { designerId: user.id, status: "REQUESTED" },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Designer Leads</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Incoming project requests</h1>
          <p className="text-sm text-neutral-500">Accept or reject customer requests.</p>
        </div>

        {leads.length === 0 ? (
          <p className="text-sm text-neutral-500">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {leads.map((project) => (
              <div key={project.id} className="rounded-2xl border border-neutral-200 p-6">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-neutral-900">{project.title}</p>
                  <p className="text-sm text-neutral-500">
                    {project.customer.name ?? project.customer.email}
                  </p>
                  <p className="text-sm text-neutral-600">{project.description}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <form action={respondProjectRequestAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="decision" value="accept" />
                    <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
                      Accept
                    </button>
                  </form>
                  <form action={respondProjectRequestAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <button className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
