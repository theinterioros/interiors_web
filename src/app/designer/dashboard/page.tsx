import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DesignerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const pendingRequests = await prisma.project.findMany({
    where: { designerId: user.id, status: "REQUESTED" },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  const activeProjects = await prisma.project.findMany({
    where: { designerId: user.id, status: { in: ["ACCEPTED", "ACTIVE"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Designer Dashboard</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Your workstream</h1>
          <p className="text-sm text-neutral-500">
            Manage incoming requests, milestones, and approvals.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Incoming requests</h2>
            <Link href="/designer/leads" className="text-sm text-neutral-600 underline">
              View all leads
            </Link>
          </div>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-neutral-500">No pending requests.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map((project) => (
                <div key={project.id} className="rounded-2xl border border-neutral-200 p-6">
                  <p className="text-sm font-semibold text-neutral-900">{project.title}</p>
                  <p className="text-xs text-neutral-500">
                    Requested by {project.customer.name ?? project.customer.email}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Active projects</h2>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-neutral-500">No active projects yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/designer/projects/${project.id}`}
                  className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400"
                >
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                    {project.status}
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">{project.title}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
