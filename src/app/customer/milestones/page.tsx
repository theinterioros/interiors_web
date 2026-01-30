import { approveMilestoneAction } from "@/app/actions/project";
import { ClipboardList } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerMilestonesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const milestones = await sql<{
    id: string;
    title: string;
    description: string;
    amount: number;
    project_title: string;
  }>`
    select m.id, m.title, m.description, m.amount, p.title as project_title
    from milestones m
    join projects p on p.id = m.project_id
    where p.customer_id = ${user.id} and m.status = 'SUBMITTED'
    order by m.updated_at desc
  `;

  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <ClipboardList className="h-4 w-4 text-amber-600" />
            Milestone Approval
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Review submissions</h1>
          <p className="text-sm text-neutral-500">Approve milestones to release payment.</p>
        </div>

        {milestones.length === 0 ? (
          <p className="text-sm text-neutral-500">No milestones awaiting approval.</p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="card">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                  {milestone.project_title}
                </p>
                <h3 className="text-lg font-semibold text-neutral-900">{milestone.title}</h3>
                <p className="text-sm text-neutral-500">{milestone.description}</p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">₹{milestone.amount}</p>
                <form action={approveMilestoneAction} className="mt-4">
                  <input type="hidden" name="milestoneId" value={milestone.id} />
                  <button className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-amber-400 hover:to-amber-500">
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
