import { Users } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

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
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Users</p>
          </div>
          <h1 className="heading-lg mb-3">All users</h1>
          <p className="text-[var(--text-muted)]">Customers, firms, and admins.</p>
        </FadeIn>

        <StaggerChildren className="space-y-3">
          {users.map((user) => (
            <FadeInItem key={user.id}>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{user.name ?? "User"}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                  </div>
                  <span className="badge">{user.role}</span>
                </div>
              </div>
            </FadeInItem>
          ))}
        </StaggerChildren>
      </div>
    </div>
  );
}
