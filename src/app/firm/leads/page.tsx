import { respondProjectRequestAction } from "@/app/actions/project";
import { Inbox } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FirmLeadsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

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
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <Inbox className="h-4 w-4 text-amber-600" />
            Firm Leads
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Incoming project requests</h1>
          <p className="text-sm text-neutral-500">Accept or reject customer requests.</p>
        </div>

        {leads.length === 0 ? (
          <p className="text-sm text-neutral-500">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {leads.map((project) => (
              <div key={project.id} className="card">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-neutral-900">{project.title}</p>
                  <p className="text-sm text-neutral-500">
                    {project.customer_name ?? project.customer_email}
                  </p>
                  <p className="text-sm text-neutral-600">{project.description}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <form action={respondProjectRequestAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="decision" value="accept" />
                    <button className="rounded-md bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-amber-400 hover:to-amber-500">
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
