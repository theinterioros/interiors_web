import Link from "next/link";
import { sql } from "@/lib/db";
import { BadgeCheck, Building2, Star, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { RoleValues } from "@/lib/types";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";
export const dynamic = "force-dynamic";

export default async function FirmProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    verified_at: Date | null;
    margin_accepted_at: Date | null;
    rating: number | null;
    google_review_links: string | null;
  }>`
    select id, user_id, name, firm_name, owner_name, experience_years, city, pincode, about, status, verified_at, margin_accepted_at, rating, google_review_links
    from firm_profiles
    where id = ${id}
    limit 1
  `;

  const isVerifiedAndAccepted =
    firm && firm.status === "APPROVED" && firm.margin_accepted_at != null;

  if (!firm) {
    return (
      <div className="page bg-white">
        <div className="page-inner">
          <div className="text-sm text-[var(--text-muted)]">Firm not found.</div>
        </div>
      </div>
    );
  }

  let portfolioWorks: { id: string; title: string; description: string | null; display_order: number }[] = [];
  try {
    portfolioWorks = await sql<{
      id: string;
      title: string;
      description: string | null;
      display_order: number;
    }>`
      select id, title, description, display_order
      from firm_portfolio_works
      where profile_id = ${firm.id}
      order by display_order, created_at
    `;
  } catch {
    // firm_portfolio_works may not exist before migration
  }

  type PortfolioFile = { id: string; work_id: string | null; blob_url: string; file_name: string; mime_type: string };
  let portfolio: PortfolioFile[];
  try {
    portfolio = await sql<PortfolioFile>`
      select id, work_id, blob_url, file_name, mime_type
      from firm_portfolio_files
      where profile_id = ${firm.id}
      order by created_at desc
    `;
  } catch {
    const flat = await sql<{ id: string; blob_url: string; file_name: string; mime_type: string }>`
      select id, blob_url, file_name, mime_type
      from firm_portfolio_files
      where profile_id = ${firm.id}
      order by created_at desc
    `;
    portfolio = flat.map((f) => ({ ...f, work_id: null }));
  }

  const filesByWork = new Map<string | null, PortfolioFile[]>();
  for (const file of portfolio) {
    const key = file.work_id ?? null;
    if (!filesByWork.has(key)) filesByWork.set(key, []);
    filesByWork.get(key)!.push(file);
  }

  const portfolioDocs = await sql<{
    id: string;
    blob_url: string;
    file_name: string;
  }>`
    select id, blob_url, file_name
    from firm_documents
    where profile_id = ${firm.id} and doc_type = 'portfolio'
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
            <p className="eyebrow">{isVerifiedAndAccepted ? "Verified Designer" : "Designer"}</p>
          </div>
          <h1 className="heading-lg mb-3">{firm.firm_name ?? firm.name}</h1>
          <p className="text-[var(--text-muted)] mb-2">
            {firm.city} • {firm.pincode} • {firm.experience_years}+ years
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-3">
            {isVerifiedAndAccepted ? (
              <span className="flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5 text-[var(--brand)]" />
                Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[var(--brand)]">
                <ShieldAlert className="h-3.5 w-3.5" />
                Unverified
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-[var(--brand)]" />
              {firm.rating ?? 4.8}/5
            </span>
            {firm.google_review_links && (
              <a
                href={firm.google_review_links}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--brand)] hover:underline"
              >
                Google reviews
              </a>
            )}
          </div>
          {firm.owner_name && (
            <p className="text-sm text-[var(--text-muted)] mb-3">Owner: {firm.owner_name}</p>
          )}

          {canRequest && isVerifiedAndAccepted ? (
            <div className="mb-6">
              <Link
                href={`/designers/${firm.id}/request`}
                className="btn btn-primary inline-flex items-center gap-2 text-base px-6 py-3 font-semibold"
              >
                Proceed with this designer
              </Link>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                You will enter project details and pay ₹1,000 for each additional project (first project included with subscription).
              </p>
            </div>
          ) : canRequest && !isVerifiedAndAccepted ? (
            <p className="text-sm text-[var(--text-muted)] mb-4">
              This designer is not yet visible for new requests. Check back after verification.
            </p>
          ) : null}

          <p className="text-[var(--text-muted)]">{firm.about}</p>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-8">
          <h2 className="heading-md mb-4">Portfolio</h2>
          {portfolioDocs.length > 0 && (
            <div className="mb-6 space-y-2">
              <p className="text-sm text-[var(--text-muted)]">Portfolio documents</p>
              {portfolioDocs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.blob_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--brand)] font-medium hover:underline"
                >
                  {doc.file_name} (PDF)
                </a>
              ))}
            </div>
          )}
          {portfolioWorks.length > 0 ? (
            <StaggerChildren className="space-y-8">
              {portfolioWorks.map((work) => {
                const files = filesByWork.get(work.id) ?? [];
                return (
                  <FadeInItem key={work.id}>
                    <section className="card" aria-labelledby={`work-${work.id}`}>
                      <h3 id={`work-${work.id}`} className="heading-sm mb-1">{work.title}</h3>
                      {work.description && (
                        <p className="text-sm text-[var(--text-muted)] mb-4">{work.description}</p>
                      )}
                      {files.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {files.map((file) => {
                            const isImage = (file.mime_type || "").startsWith("image/");
                            return (
                              <a
                                key={file.id}
                                href={file.blob_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block overflow-hidden rounded-lg border border-[var(--border)] hover:border-[var(--border-strong)]"
                              >
                                {isImage ? (
                                  <img
                                    src={file.blob_url}
                                    alt={file.file_name}
                                    className="w-full aspect-[4/3] object-cover"
                                  />
                                ) : null}
                                <p className="text-xs text-[var(--text-muted)] p-2">{file.file_name}</p>
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]">No images for this work yet.</p>
                      )}
                    </section>
                  </FadeInItem>
                );
              })}
              {(filesByWork.get(null)?.length ?? 0) > 0 && (
                <FadeInItem>
                  <section className="card" aria-labelledby="portfolio-other">
                    <h3 id="portfolio-other" className="heading-sm mb-4">Other portfolio images</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filesByWork.get(null)!.map((file) => {
                        const isImage = (file.mime_type || "").startsWith("image/");
                        return (
                          <a
                            key={file.id}
                            href={file.blob_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-lg border border-[var(--border)] hover:border-[var(--border-strong)]"
                          >
                            {isImage ? (
                              <img
                                src={file.blob_url}
                                alt={file.file_name}
                                className="w-full aspect-[4/3] object-cover"
                              />
                            ) : null}
                            <p className="text-xs text-[var(--text-muted)] p-2">{file.file_name}</p>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                </FadeInItem>
              )}
            </StaggerChildren>
          ) : portfolio.length === 0 && portfolioDocs.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No portfolio items yet.</p>
          ) : portfolio.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No additional portfolio items.</p>
          ) : (
            <StaggerChildren className="space-y-8">
              <section className="card">
                <h3 className="heading-sm mb-4">Portfolio images</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolio.map((file) => {
                    const isImage = (file.mime_type || "").startsWith("image/");
                    return (
                      <FadeInItem key={file.id}>
                        <a
                          href={file.blob_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-lg border border-[var(--border)] hover:border-[var(--border-strong)]"
                        >
                          {isImage ? (
                            <img
                              src={file.blob_url}
                              alt={file.file_name}
                              className="w-full aspect-[4/3] object-cover"
                            />
                          ) : null}
                          <p className="text-xs text-[var(--text-muted)] p-2">{file.file_name}</p>
                        </a>
                      </FadeInItem>
                    );
                  })}
                </div>
              </section>
            </StaggerChildren>
          )}
        </FadeIn>

        {!canRequest && (
          <FadeIn delay={0.4}>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Sign in as a customer to request a meetup with this designer.
            </p>
            <Link href="/login?role=customer" className="btn btn-primary">
              Sign in
            </Link>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
