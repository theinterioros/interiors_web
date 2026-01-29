import Link from "next/link";
import { BadgeCheck, Building2, Star } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FirmsPage() {
  await requireUser();
  const firms = await sql<{
    id: string;
    name: string;
    firm_name: string | null;
    city: string;
    experience_years: number;
    rating: number | null;
  }>`
    select id, name, firm_name, city, experience_years, rating
    from firm_profiles
    where status = 'APPROVED'
    order by created_at desc
  `;

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)] px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-500">
            <Building2 className="h-4 w-4 text-amber-600" />
            Verified Firms
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Browse approved interior firms</h1>
          <p className="text-sm text-neutral-500">
            Only vetted firms are visible. Each profile is reviewed by Interior OS.
          </p>
        </div>

        {firms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/70 bg-white/70 p-8 text-sm text-neutral-500">
            No approved firms yet. Please check back soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {firms.map((firm) => (
              <div
                key={firm.id}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:border-neutral-300 transition"
              >
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-neutral-900">
                    {firm.firm_name ?? firm.name}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {firm.city} • {firm.experience_years}+ years
                  </p>
                  <p className="text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5 text-amber-600" />
                      Verified
                    </span>{" "}
                    •{" "}
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {firm.rating ?? 4.8}/5
                    </span>
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="h-16 rounded-lg border border-white/70 bg-gradient-to-br from-amber-100 via-white to-rose-100"
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                  <Link
                    href={`/designers/${firm.id}`}
                    className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
                  >
                    View profile
                  </Link>
                  <button className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700">
                    Request a call
                  </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
