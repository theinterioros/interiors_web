import { approveMilestoneAction } from "@/app/actions/project";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [project] = await sql<{
    id: string;
    title: string;
    status: string;
    firm_name: string | null;
  }>`
    select p.id, p.title, p.status, u.name as firm_name
    from projects p
    join users u on u.id = p.firm_id
    where p.id = ${params.id} and p.customer_id = ${user.id}
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

  const completedCount = milestones.filter((milestone) => milestone.status === "APPROVED").length;
  const progressPercent =
    milestones.length === 0 ? 0 : Math.round((completedCount / milestones.length) * 100);
  const nextMilestone = milestones.find((milestone) => milestone.status !== "APPROVED");

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Project View</p>
          <h1 className="text-3xl font-semibold text-neutral-900">{project.title}</h1>
          <p className="text-sm text-neutral-500">
            Firm: {project.firm_name ?? "Interior firm"} • Status: {project.status}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Overall progress</p>
              <p className="text-lg font-semibold text-neutral-900">{progressPercent}% complete</p>
              <p className="text-xs text-neutral-500">
                Current phase: {nextMilestone?.title ?? "All milestones approved"}
              </p>
            </div>
            <div className="text-right text-xs text-neutral-500">
              Next payment milestone: {nextMilestone?.title ?? "None pending"}
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-neutral-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Milestones</h2>
          {milestones.length === 0 ? (
            <p className="text-sm text-neutral-500">No milestones yet.</p>
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
                    <div className="mt-4 grid gap-2 md:grid-cols-2">
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
                  {milestone.status === "SUBMITTED" && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <form action={approveMilestoneAction}>
                        <input type="hidden" name="milestoneId" value={milestone.id} />
                        <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
                          Approve milestone
                        </button>
                      </form>
                      <button className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700">
                        Raise issue
                      </button>
                    </div>
                  )}
                  <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
                    Comments area (customer + firm)
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
