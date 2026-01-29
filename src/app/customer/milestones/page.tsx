import { approveMilestoneAction } from "@/app/actions/project";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CustomerMilestonesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const milestones = await prisma.milestone.findMany({
    where: {
      project: { customerId: user.id },
      status: "SUBMITTED",
    },
    include: { project: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Milestone Approval</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Review submissions</h1>
          <p className="text-sm text-neutral-500">Approve milestones to release payment.</p>
        </div>

        {milestones.length === 0 ? (
          <p className="text-sm text-neutral-500">No milestones awaiting approval.</p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-2xl border border-neutral-200 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                  {milestone.project.title}
                </p>
                <h3 className="text-lg font-semibold text-neutral-900">{milestone.title}</h3>
                <p className="text-sm text-neutral-500">{milestone.description}</p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">₹{milestone.amount}</p>
                <form action={approveMilestoneAction} className="mt-4">
                  <input type="hidden" name="milestoneId" value={milestone.id} />
                  <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
                    Approve milestone
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
