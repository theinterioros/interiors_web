import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const projects = await prisma.project.findMany({
    where: { customerId: user.id },
    include: { designer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Customer Dashboard</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Your projects</h1>
          <p className="text-sm text-neutral-500">Track milestone approvals and payments.</p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-sm text-neutral-500">
            No projects yet. Browse verified designers to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/customer/projects/${project.id}`}
                className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400"
              >
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                    {project.status}
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-900">{project.title}</h3>
                  <p className="text-sm text-neutral-500">
                    Designer: {project.designer.name ?? "Designer"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
