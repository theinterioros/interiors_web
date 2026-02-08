import Link from "next/link";
import { initiateProjectAction } from "@/app/actions/project";
import { Inbox } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";

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
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Inbox className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Leads</p>
        </div>
        <h1 className="heading-lg mb-1">Incoming Leads</h1>
        <p className="text-sm text-[var(--text-muted)] mb-2">
          Leads are created when a customer requests a meetup from your studio (Browse designers → your profile → Request meetup). When you agree to work together, click <strong>Initiate project</strong> to create an active project where you can add milestones and receive payments.
        </p>
      </header>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            No leads yet.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {leads.map((project) => (
              <li key={project.id} className="px-4 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="badge text-xs">LEAD</span>
                    <h3 className="font-semibold text-[var(--foreground)]">{project.title}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {project.customer_name ?? project.customer_email}
                    </p>
                    {project.description && (
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2 mt-1">{project.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={initiateProjectAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <button type="submit" className="btn btn-primary text-sm">
                        Initiate project
                      </button>
                    </form>
                    <Link href={`/firm/projects/${project.id}`} className="btn btn-secondary text-sm">
                      View
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
