import { prisma } from "@/lib/prisma";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { customer: true, designer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Projects</p>
          <h1 className="text-3xl font-semibold text-neutral-900">All projects</h1>
          <p className="text-sm text-neutral-500">Track overall project status.</p>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-neutral-500">No projects created yet.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{project.title}</p>
                    <p className="text-xs text-neutral-500">
                      {project.customer.email} → {project.designer.email}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
