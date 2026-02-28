import Link from "next/link";
import { Users, User, Building2, Shield, ExternalLink } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import PageTabs from "@/components/ui/PageTabs";
import TableFilterBar from "@/components/ui/TableFilterBar";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ role?: string; q?: string }> };

function matchSearch(row: { name: string | null; email: string; firm_name: string | null }, q: string) {
  const s = q.toLowerCase();
  return (
    (row.name ?? "").toLowerCase().includes(s) ||
    row.email.toLowerCase().includes(s) ||
    (row.firm_name ?? "").toLowerCase().includes(s)
  );
}

const ROLES = [
  { value: "", label: "All", role: null as string | null },
  { value: "CUSTOMER", label: "Customers", role: "CUSTOMER" },
  { value: "FIRM", label: "Designers", role: "FIRM" },
  { value: "ADMIN", label: "Admins", role: "ADMIN" },
];

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterRole = params?.role ?? "";
  const q = (params?.q ?? "").trim();

  const users = await sql<{
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
    created_at: Date;
    firm_name: string | null;
    firm_city: string | null;
    firm_pincode: string | null;
    firm_status: string | null;
    project_count: string;
    has_paid_registration: boolean | null;
  }>`
    select
      u.id, u.name, u.email, u.phone, u.role, u.created_at,
      fp.firm_name,
      fp.city as firm_city,
      fp.pincode as firm_pincode,
      fp.status as firm_status,
      (
        select count(*)::text from projects p
        where p.customer_id = u.id or p.firm_id = u.id
      ) as project_count,
      (
        case when u.role = 'CUSTOMER' then
          exists (select 1 from payment_ledger pl where pl.customer_id = u.id and pl.type = 'CUSTOMER_REGISTRATION_FEE' and pl.status = 'RELEASED')
        when u.role = 'FIRM' then
          exists (select 1 from payment_ledger pl where pl.firm_id = u.id and pl.type = 'FIRM_REGISTRATION_FEE' and pl.status = 'RELEASED')
        else null end
      ) as has_paid_registration
    from users u
    left join firm_profiles fp on fp.user_id = u.id
    order by u.role asc, u.created_at desc
  `;

  const counts = {
    all: users.length,
    CUSTOMER: users.filter((u) => u.role === "CUSTOMER").length,
    FIRM: users.filter((u) => u.role === "FIRM").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  const roleFiltered = filterRole
    ? users.filter((u) => u.role === filterRole)
    : users;
  const filtered = q ? roleFiltered.filter((u) => matchSearch(u, q)) : roleFiltered;

  const base = "/admin/users";
  const queryString = (role: string) => {
    const sp = new URLSearchParams();
    if (role) sp.set("role", role);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return s ? `?${s}` : "";
  };
  const tabs = ROLES.map((r) => ({
    label: r.label,
    href: base + queryString(r.value),
    active: (filterRole || "") === r.value,
    count: r.value === "" ? counts.all : counts[r.value as keyof typeof counts],
  }));

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Users</p>
        </div>
        <h1 className="heading-lg mb-3">All users</h1>
        <p className="text-sm text-[var(--text-muted)]">
          All accounts: contact info, role, firm or subscription status, and project count. Filter by role or search by name or email.
        </p>
      </FadeIn>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4">
        <PageTabs tabs={tabs} className="mb-0 sm:flex-1 sm:min-w-0 order-2 sm:order-1" />
        <div className="w-full sm:w-auto order-1 sm:order-2">
          <TableFilterBar
            value={q}
            placeholder="Search by name or email…"
            preserveParams={filterRole ? { role: filterRole } : {}}
          />
        </div>
      </div>

      <FadeIn delay={0.05}>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-white p-6 sm:p-8 text-center text-[var(--text-muted)]">
            {q
              ? "No users match your search."
              : filterRole
                ? `No ${ROLES.find((r) => r.value === filterRole)?.label.toLowerCase() ?? "users"} yet.`
                : "No users yet."}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Email / Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Details</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Projects</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Status / Paid</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-subtle)]/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                              {user.role === "CUSTOMER" ? (
                                <User className="h-4 w-4" />
                              ) : user.role === "FIRM" ? (
                                <Building2 className="h-4 w-4" />
                              ) : (
                                <Shield className="h-4 w-4" />
                              )}
                            </span>
                            <span className="font-medium text-[var(--foreground)]">{user.name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="block text-[var(--foreground)]">{user.email}</span>
                          {user.phone && (
                            <span className="block text-xs text-[var(--text-muted)]">{user.phone}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              user.role === "ADMIN"
                                ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                                : user.role === "FIRM"
                                  ? "bg-[var(--brand)]/15 text-[var(--brand)]"
                                  : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                            }`}
                          >
                            {user.role === "FIRM" ? "Designer" : user.role === "CUSTOMER" ? "Customer" : "Admin"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">
                          {user.role === "FIRM" && (
                            <>
                              {user.firm_name && <span className="block font-medium text-[var(--foreground)]">{user.firm_name}</span>}
                              {(user.firm_city || user.firm_pincode) && (
                                <span className="block text-xs">{[user.firm_city, user.firm_pincode].filter(Boolean).join(" · ")}</span>
                              )}
                              {!user.firm_name && !user.firm_city && !user.firm_pincode && <span className="text-xs">No profile yet</span>}
                            </>
                          )}
                          {user.role === "CUSTOMER" && <span className="text-xs">—</span>}
                          {user.role === "ADMIN" && <span className="text-xs">—</span>}
                        </td>
                        <td className="py-3 px-4 text-right">{user.project_count}</td>
                        <td className="py-3 px-4">
                          {user.role === "FIRM" && (
                            <div className="space-y-0.5">
                              {user.firm_status && (
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    user.firm_status === "APPROVED"
                                      ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]"
                                      : user.firm_status === "PENDING"
                                        ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                                        : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                                  }`}
                                >
                                  {user.firm_status}
                                </span>
                              )}
                              <span className={`block text-xs ${user.has_paid_registration ? "text-[var(--accent-emerald)]" : "text-[var(--text-muted)]"}`}>
                                {user.has_paid_registration === true ? "Subscription active" : user.has_paid_registration === false ? "Subscription pending" : "—"}
                              </span>
                            </div>
                          )}
                          {user.role === "CUSTOMER" && (
                            <span className={`text-xs ${user.has_paid_registration ? "text-[var(--accent-emerald)]" : "text-[var(--text-muted)]"}`}>
                              {user.has_paid_registration === true ? "Subscribed" : user.has_paid_registration === false ? "Not subscribed" : "—"}
                            </span>
                          )}
                          {user.role === "ADMIN" && <span className="text-xs">—</span>}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {user.role === "FIRM" && (
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="inline-flex items-center gap-1 text-sm text-[var(--brand)] hover:underline"
                            >
                              View history
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
