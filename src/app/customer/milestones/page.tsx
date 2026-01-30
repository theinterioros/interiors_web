import { approveMilestoneAction } from "@/app/actions/project";
import { ClipboardList } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function CustomerMilestonesPage() {
  const user = await requireCustomerPaid();

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
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Milestone Approval</p>
          </div>
          <h1 className="heading-lg mb-3">Review submissions</h1>
          <p className="text-[var(--text-muted)]">Approve milestones to release payment.</p>
        </FadeIn>

        {milestones.length === 0 ? (
          <FadeIn>
            <p className="text-sm text-[var(--text-muted)]">No milestones awaiting approval.</p>
          </FadeIn>
        ) : (
          <StaggerChildren className="space-y-4">
            {milestones.map((milestone) => (
              <FadeInItem key={milestone.id}>
                <div className="card">
                  <p className="eyebrow mb-2">{milestone.project_title}</p>
                  <h3 className="heading-md mb-2">{milestone.title}</h3>
                  <p className="text-[var(--text-muted)] mb-3">{milestone.description}</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] mb-4">
                    ₹{milestone.amount.toLocaleString()}
                  </p>
                  <form action={approveMilestoneAction}>
                    <input type="hidden" name="milestoneId" value={milestone.id} />
                    <button type="submit" className="btn btn-primary">
                      Approve milestone
                    </button>
                  </form>
                </div>
              </FadeInItem>
            ))}
          </StaggerChildren>
        )}
      </div>
    </div>
  );
}
