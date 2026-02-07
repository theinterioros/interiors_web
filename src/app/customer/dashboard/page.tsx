import Link from "next/link";
import { BarChart3, CreditCard, Layers, PlusCircle, Users } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import DashboardEstimatePanel from "@/components/customer/DashboardEstimatePanel";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const user = await requireCustomerPaid();

  const projects = await sql<{
    id: string;
    status: string;
    title: string;
    designer_name: string | null;
  }>`
    select p.id, p.status, p.title, u.name as designer_name
    from projects p
    left join users u on u.id = p.firm_id
    where p.customer_id = ${user.id}
    order by p.created_at desc
  `;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Customer Dashboard</p>
          </div>
          <h1 className="heading-lg mb-3">Plan your interior journey</h1>
          <p className="text-[var(--text-muted)]">
            Start a project with a verified designer, then track approvals, milestones, and payments.
          </p>
        </div>

        {/* Start a project CTA */}
        <div className="mb-8">
          <Link
            href="/designers"
            className="card flex items-center gap-4 p-6 border-2 border-[var(--brand)]/30 bg-[var(--brand-light)]/10 hover:border-[var(--brand)]/50 hover:bg-[var(--brand-light)]/20 transition-colors"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="heading-md mb-1">Start a project</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Browse verified designers and request a meetup to create your first (or next) project.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-[var(--brand)] font-semibold">
              <Users className="h-5 w-5" />
              Browse designers
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/customer/payments" className="btn btn-secondary">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Ledger
          </Link>
          <Link href="/customer/digital-twin" className="btn btn-secondary">
            <Layers className="h-4 w-4 mr-2" />
            Digital Twin
          </Link>
        </div>

        {/* Input + Output panels — estimate shown only after customer enters details */}
        <DashboardEstimatePanel />

        {/* Active Projects */}
        <div>
          <h2 className="heading-md mb-6">Your projects</h2>
          {projects.length === 0 ? (
            <div className="card text-center text-[var(--text-muted)] py-8">
              <p className="mb-4">No projects yet.</p>
              <Link href="/designers" className="btn btn-primary inline-flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Start a project
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/customer/projects/${project.id}`}
                  className="card hover:border-[var(--border-strong)] transition-colors"
                >
                  <p className="eyebrow mb-2">{project.status}</p>
                  <h3 className="heading-md mb-2">{project.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Designer: {project.designer_name ?? "—"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
