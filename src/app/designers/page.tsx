import Link from "next/link";
import { BadgeCheck, Building2, Star, Users } from "lucide-react";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FirmsPage() {
  const firms = await sql<{
    id: string;
    name: string;
    firm_name: string | null;
    city: string;
    experience_years: number;
    rating: number | null;
    status: string;
    verified_at: Date | null;
    margin_accepted_at: Date | null;
    customers_count: string;
  }>`
    select fp.id, fp.name, fp.firm_name, fp.city, fp.experience_years, fp.rating, fp.status, fp.verified_at, fp.margin_accepted_at,
           (select count(distinct p.customer_id)::text from projects p where p.firm_id = fp.user_id and p.status in ('ACCEPTED', 'ACTIVE')) as customers_count
    from firm_profiles fp
    where fp.status = 'APPROVED'
      and fp.margin_accepted_at is not null
      and exists (select 1 from payment_ledger pl where pl.firm_id = fp.user_id and pl.type = 'FIRM_REGISTRATION_FEE' and pl.status = 'RELEASED')
    order by fp.margin_accepted_at desc, fp.verified_at desc nulls last, fp.created_at desc
  `;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Designers</p>
        </div>
        <h1 className="heading-lg mb-1">Browse Verified Designers</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Verified designers on the platform. View profiles and request a meetup to start a project.
        </p>
      </header>

      {firms.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-white p-10 text-center text-sm text-[var(--text-muted)]">
          No verified designers yet. Please check back soon.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {firms.map((firm) => (
            <Link
              key={firm.id}
              href={`/designers/${firm.id}`}
              className="rounded-lg border border-[var(--border)] bg-white p-5 hover:border-[var(--border-strong)] hover:shadow-sm transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-[var(--foreground)]">{firm.firm_name ?? firm.name}</h3>
                <span className="badge shrink-0 text-xs">Verified</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-3">
                {firm.city} · {firm.experience_years}+ years
              </p>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-4">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-[var(--brand)]" />
                  {firm.rating ?? "—"}/5
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-[var(--brand)]" />
                  {firm.customers_count === "0" ? "No" : firm.customers_count} active customer{firm.customers_count !== "1" ? "s" : ""}
                </span>
              </div>
              <span className="mt-auto text-sm font-medium text-[var(--brand)]">
                View profile →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
