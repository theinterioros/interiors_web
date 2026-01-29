import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Users</p>
          <h1 className="text-3xl font-semibold text-neutral-900">All users</h1>
          <p className="text-sm text-neutral-500">Customers, designers, and admins.</p>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{user.name ?? "User"}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">{user.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
