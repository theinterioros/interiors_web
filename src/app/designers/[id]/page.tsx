import { sql } from "@/lib/db";
import { BadgeCheck, Building2, Star } from "lucide-react";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { RoleValues } from "@/lib/types";
import { requestProjectAction } from "@/app/actions/project";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function FirmProfilePage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser();
  const [firm] = await sql<{
    id: string;
    user_id: string;
    name: string;
    firm_name: string | null;
    owner_name: string | null;
    experience_years: number;
    city: string;
    pincode: string;
    about: string;
    status: string;
  }>`
    select id, user_id, name, firm_name, owner_name, experience_years, city, pincode, about, status
    from firm_profiles
    where id = ${params.id}
    limit 1
  `;

  if (!firm || firm.status !== "APPROVED") {
    return (
      <div className="page bg-white">
        <div className="page-inner">
          <div className="text-sm text-[var(--text-muted)]">Firm not found or not approved yet.</div>
        </div>
      </div>
    );
  }

  const portfolio = await sql<{
    id: string;
    blob_url: string;
    file_name: string;
  }>`
    select id, blob_url, file_name
    from firm_portfolio_files
    where profile_id = ${firm.id}
    order by created_at desc
  `;

  const user = await getCurrentUser();
  const canRequest = user?.role === RoleValues.CUSTOMER;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Verified Firm</p>
          </div>
          <h1 className="heading-lg mb-3">{firm.firm_name ?? firm.name}</h1>
          <p className="text-[var(--text-muted)] mb-2">
            {firm.city} • {firm.pincode} • {firm.experience_years}+ years
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-3">
            <span className="flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-[var(--brand)]" />
              Verified
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-[var(--brand)]" />
              4.8/5
            </span>
          </div>
          {firm.owner_name && (
            <p className="text-sm text-[var(--text-muted)] mb-3">Owner: {firm.owner_name}</p>
          )}
          <p className="text-[var(--text-muted)]">{firm.about}</p>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-8">
          <h2 className="heading-md mb-4">Portfolio</h2>
          {portfolio.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Portfolio uploads coming soon.</p>
          ) : (
            <StaggerChildren className="grid gap-4 md:grid-cols-2">
              {portfolio.map((file) => (
                <FadeInItem key={file.id}>
                  <a
                    href={file.blob_url}
                    target="_blank"
                    rel="noreferrer"
                    className="card hover:border-[var(--border-strong)] transition-colors"
                  >
                    <p className="text-sm text-[var(--text-muted)]">{file.file_name}</p>
                  </a>
                </FadeInItem>
              ))}
            </StaggerChildren>
          )}
        </FadeIn>

        <FadeIn delay={0.3} className="mb-8">
          <h2 className="heading-md mb-4">Past projects</h2>
          <StaggerChildren className="grid gap-4 md:grid-cols-3">
            {["Modern 3BHK", "Villa refresh", "Compact studio"].map((label) => (
              <FadeInItem key={label} className="card">
                <div className="h-24 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] mb-3" />
                <p className="font-semibold text-[var(--foreground)] mb-1">{label}</p>
                <p className="text-xs text-[var(--text-muted)]">Bengaluru • Residential</p>
              </FadeInItem>
            ))}
          </StaggerChildren>
        </FadeIn>

        {canRequest ? (
          <FadeIn delay={0.4}>
            <form action={requestProjectAction} className="card space-y-4">
              <input type="hidden" name="firmId" value={firm.user_id} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Project title</label>
                <input name="title" required className="input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Project details</label>
                <textarea name="description" rows={4} className="input" />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn btn-primary">
                  Request Project
                </button>
                <button type="button" className="btn btn-secondary">
                  Select Firm
                </button>
              </div>
            </form>
          </FadeIn>
        ) : (
          <FadeIn delay={0.4}>
            <p className="text-sm text-[var(--text-muted)]">
              Sign in as a customer to request a project with this firm.
            </p>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
