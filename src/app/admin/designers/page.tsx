import { approveFirmAction, rejectFirmAction } from "@/app/actions/admin";
import { BadgeCheck } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function AdminDesignersPage() {
  const pending = await sql<{
    id: string;
    name: string;
    city: string;
    pincode: string;
    experience_years: number;
    about: string;
  }>`
    select id, name, city, pincode, experience_years, about
    from firm_profiles
    where status = 'PENDING'
    order by created_at desc
  `;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Firm Approvals</p>
          </div>
          <h1 className="heading-lg mb-3">Review applications</h1>
          <p className="text-[var(--text-muted)]">Approve firms to show publicly.</p>
        </FadeIn>

        {pending.length === 0 ? (
          <FadeIn>
            <p className="text-sm text-[var(--text-muted)]">No pending approvals.</p>
          </FadeIn>
        ) : (
          <StaggerChildren className="space-y-4">
            {pending.map((profile) => (
              <FadeInItem key={profile.id}>
                <div className="card">
                  <div className="space-y-2 mb-4">
                    <h3 className="heading-md">{profile.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {profile.city} • {profile.pincode} • {profile.experience_years}+ years
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{profile.about}</p>
                  </div>
                  <div className="card-subtle mb-4">
                    <p className="eyebrow mb-3">Document checklist</p>
                    <div className="grid gap-2 sm:grid-cols-2 text-xs text-[var(--text-muted)]">
                      <span>GST certificate</span>
                      <span>Company registration / MSME</span>
                      <span>PAN</span>
                      <span>Bank details</span>
                      <span>Portfolio quality</span>
                      <span>City coverage</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <form action={approveFirmAction}>
                      <input type="hidden" name="profileId" value={profile.id} />
                      <button type="submit" className="btn btn-primary">
                        Approve
                      </button>
                    </form>
                    <form action={rejectFirmAction}>
                      <input type="hidden" name="profileId" value={profile.id} />
                      <button type="submit" className="btn btn-secondary">
                        Reject
                      </button>
                    </form>
                    <button type="button" className="btn btn-secondary">
                      Request info
                    </button>
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
