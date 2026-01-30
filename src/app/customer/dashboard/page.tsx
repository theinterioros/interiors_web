import Link from "next/link";
import { BarChart3, CreditCard, Layers } from "lucide-react";
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
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-500">
            <BarChart3 className="h-4 w-4 text-amber-600" />
            Customer Dashboard
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Plan your interior journey</h1>
          <p className="text-sm text-neutral-600">
            Start with a quick estimate, then track approvals, milestones, and payments.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/customer/payments"
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-neutral-700"
          >
            <CreditCard className="h-4 w-4 text-amber-600" />
            Payments & Escrow
          </Link>
          <Link
            href="/customer/digital-twin"
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-neutral-700"
          >
            <Layers className="h-4 w-4 text-amber-600" />
            Digital Twin
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card card-soft">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Input panel</p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-900">Property details</h2>
            <form className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">City</label>
                  <input className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Property type</label>
                  <select className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm">
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Individual home</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Carpet area</label>
                  <input className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Rooms</label>
                  <select className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm">
                    <option>1 BHK</option>
                    <option>2 BHK</option>
                    <option>3 BHK</option>
                    <option>4 BHK</option>
                    <option>5+ BHK</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Budget range</label>
                <select className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm">
                  <option>0–5 lakhs</option>
                  <option>5–10 lakhs</option>
                  <option>10–20 lakhs</option>
                  <option>20–35 lakhs</option>
                  <option>35+ lakhs</option>
                </select>
              </div>
            </form>
          </div>

          <div className="card card-soft">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Output panel</p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-900">Estimated cost breakup</h2>
            <div className="mt-4 space-y-3 text-sm text-neutral-600">
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span>Design & planning</span>
                <span>₹1.2L</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span>Carpentry & storage</span>
                <span>₹4.6L</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span>Kitchen & utility</span>
                <span>₹3.4L</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span>Lighting & fixtures</span>
                <span>₹1.1L</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              Disclaimer: Estimates are approximate and vary by scope, materials, and site conditions.
            </p>
            <Link
              href="/customer/visualization"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500"
            >
              Proceed to Visualization
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Active projects</h2>
          {projects.length === 0 ? (
            <div className="card card-soft text-sm text-neutral-500">
              No projects yet. Browse verified firms to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/customer/projects/${project.id}`}
                  className="card card-soft hover:border-neutral-300"
                >
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                      {project.status}
                    </p>
                    <h3 className="text-lg font-semibold text-neutral-900">{project.title}</h3>
                    <p className="text-sm text-neutral-500">
                      Firm: {project.firm_name ?? "Interior firm"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
