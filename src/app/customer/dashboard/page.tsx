import Link from "next/link";
import { BarChart3, CreditCard, Layers, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

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

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {/* Input Panel */}
          <div className="card">
            <p className="eyebrow mb-3">Input panel</p>
            <h2 className="heading-md mb-6">Property details</h2>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">City</label>
                  <input className="input" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Property type</label>
                  <select className="input">
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Individual home</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Carpet area</label>
                  <input className="input" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Rooms</label>
                  <select className="input">
                    <option>1 BHK</option>
                    <option>2 BHK</option>
                    <option>3 BHK</option>
                    <option>4 BHK</option>
                    <option>5+ BHK</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Budget range</label>
                <select className="input">
                  <option>0–5 lakhs</option>
                  <option>5–10 lakhs</option>
                  <option>10–20 lakhs</option>
                  <option>20–35 lakhs</option>
                  <option>35+ lakhs</option>
                </select>
              </div>
            </form>
          </div>

          {/* Output Panel */}
          <div className="card-subtle">
            <p className="eyebrow mb-3">Output panel</p>
            <h2 className="heading-md mb-6">Estimated cost breakup</h2>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-muted)]">Design & planning</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">₹1.2L</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-muted)]">Carpentry & storage</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">₹4.6L</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-muted)]">Kitchen & utility</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">₹3.4L</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--text-muted)]">Lighting & fixtures</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">₹1.1L</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-subtle)] mb-6">
              Disclaimer: Estimates are approximate and vary by scope, materials, and site conditions.
            </p>
            <Link href="/customer/visualization" className="btn btn-primary w-full">
              Proceed to Visualization
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

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
