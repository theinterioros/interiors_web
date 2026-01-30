import Link from "next/link";
import { BarChart3, CreditCard, Layers } from "lucide-react";
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
    firm_name: string | null;
  }>`
    select p.id, p.status, p.title, u.name as firm_name
    from projects p
    join users u on u.id = p.firm_id
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
            Start with a quick estimate, then track approvals, milestones, and payments.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/customer/payments" className="btn btn-secondary">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments & Escrow
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
          <h2 className="heading-md mb-6">Active projects</h2>
          {projects.length === 0 ? (
            <div className="card text-center text-[var(--text-muted)]">
              No projects yet. Browse verified firms to get started.
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
                    Firm: {project.firm_name ?? "Interior firm"}
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
