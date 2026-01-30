import Link from "next/link";
import { BadgeCheck, Building2, Star, ShieldAlert } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

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
  }>`
    select id, name, firm_name, city, experience_years, rating, status, verified_at
    from firm_profiles
    order by (verified_at is not null and status = 'APPROVED') desc nulls last, created_at desc
  `;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Verified Firms</p>
          </div>
          <h1 className="heading-lg mb-3">Browse interior firms</h1>
          <p className="text-[var(--text-muted)]">
            Verified firms are reviewed by Interior OS. Unverified firms are listed but not yet approved.
          </p>
        </FadeIn>

        {firms.length === 0 ? (
          <FadeIn>
            <div className="card text-center text-[var(--text-muted)]">
              No approved firms yet. Please check back soon.
            </div>
          </FadeIn>
        ) : (
          <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {firms.map((firm) => (
              <FadeInItem key={firm.id}>
                <div className="card hover:border-[var(--border-strong)] transition-colors">
                  <div className="space-y-3 mb-4">
                    <h3 className="heading-md">{firm.firm_name ?? firm.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {firm.city} • {firm.experience_years}+ years
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] flex-wrap">
                      {firm.verified_at && firm.status === "APPROVED" ? (
                        <span className="flex items-center gap-1">
                          <BadgeCheck className="h-3.5 w-3.5 text-[var(--brand)]" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Unverified
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-[var(--brand)]" />
                        {firm.rating ?? 4.8}/5
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className="h-16 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]"
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/designers/${firm.id}`}
                        className="btn btn-primary flex-1 text-xs"
                      >
                        View profile
                      </Link>
                      <button className="btn btn-secondary text-xs">
                        Request call
                      </button>
                    </div>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </StaggerChildren>
        )}
      </div>
    </div>
  );
}
