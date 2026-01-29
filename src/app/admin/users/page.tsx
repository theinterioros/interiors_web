import { Users } from "lucide-react";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await sql<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>`
    select id, name, email, role
    from users
    order by created_at desc
  `;

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)] px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <Users className="h-4 w-4 text-amber-600" />
            Users
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">All users</h1>
          <p className="text-sm text-neutral-500">Customers, firms, and admins.</p>
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
