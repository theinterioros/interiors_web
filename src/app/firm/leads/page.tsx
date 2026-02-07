import Link from "next/link";
import { initiateProjectAction } from "@/app/actions/project";
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
    status: string;
  }>`
    select p.id, p.title, p.description, u.name as customer_name, u.email as customer_email, p.status
    from projects p
    join users u on u.id = p.customer_id
    where p.firm_id = ${user.id} and p.status = 'LEAD'
    order by p.created_at desc
  `;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Inbox className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Designer Leads</p>
          </div>
          <h1 className="heading-lg mb-3">Leads (request meetup)</h1>
          <p className="text-[var(--text-muted)]">
            After the meetup, click &quot;Initiate Project&quot; to move the project to Active.
          </p>
        </FadeIn>

        {leads.length === 0 ? (
          <FadeIn>
            <p className="text-sm text-[var(--text-muted)]">No leads yet.</p>
          </FadeIn>
        ) : (
          <StaggerChildren className="space-y-4">
            {leads.map((project) => (
              <FadeInItem key={project.id}>
                <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <p className="eyebrow">LEAD</p>
                    <h3 className="heading-md">{project.title}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {project.customer_name ?? project.customer_email}
                    </p>
                    {project.description && (
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <form action={initiateProjectAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <button type="submit" className="btn btn-primary">
                        Initiate Project
                      </button>
                    </form>
                    <Link href={`/firm/projects/${project.id}`} className="btn btn-secondary">
                      View
                    </Link>
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
