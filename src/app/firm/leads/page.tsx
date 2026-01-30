import { respondProjectRequestAction } from "@/app/actions/project";
import { Inbox } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function FirmLeadsPage() {
  const user = await requireFirmPaid();

  const leads = await sql<{
    id: string;
    title: string;
    description: string | null;
    customer_name: string | null;
    customer_email: string;
  }>`
    select p.id, p.title, p.description, u.name as customer_name, u.email as customer_email
    from projects p
    join users u on u.id = p.customer_id
    where p.firm_id = ${user.id} and p.status = 'REQUESTED'
    order by p.created_at desc
  `;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Inbox className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Firm Leads</p>
          </div>
          <h1 className="heading-lg mb-3">Incoming project requests</h1>
          <p className="text-[var(--text-muted)]">Accept or reject customer requests.</p>
        </FadeIn>

        {leads.length === 0 ? (
          <FadeIn>
            <p className="text-sm text-[var(--text-muted)]">No pending requests.</p>
          </FadeIn>
        ) : (
          <StaggerChildren className="space-y-4">
            {leads.map((project) => (
              <FadeInItem key={project.id}>
                <div className="card">
                  <div className="space-y-2 mb-4">
                    <h3 className="heading-md">{project.title}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {project.customer_name ?? project.customer_email}
                    </p>
                    {project.description && (
                      <p className="text-sm text-[var(--text-muted)]">{project.description}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <form action={respondProjectRequestAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="decision" value="accept" />
                      <button type="submit" className="btn btn-primary">
                        Accept
                      </button>
                    </form>
                    <form action={respondProjectRequestAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="decision" value="reject" />
                      <button type="submit" className="btn btn-secondary">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </StaggerChildren>
        )}
      </div>
    </div>
  );
}
