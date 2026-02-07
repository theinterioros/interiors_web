import { ClipboardList } from "lucide-react";
import ApproveMilestonePay from "@/components/customer/ApproveMilestonePay";
import BeforeAfterSlider from "@/components/customer/BeforeAfterSlider";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function CustomerProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCustomerPaid();

  const [project] = await sql<{
    id: string;
    title: string;
    status: string;
    firm_name: string | null;
  }>`
    select p.id, p.title, p.status, u.name as firm_name
    from projects p
    join users u on u.id = p.firm_id
    where p.id = ${id} and p.customer_id = ${user.id}
    limit 1
  `;

  if (!project) {
    return (
      <div className="page bg-white">
        <div className="page-inner">
          <div className="text-sm text-[var(--text-muted)]">Project not found.</div>
        </div>
      </div>
    );
  }

  const milestones = await sql<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: string;
  }>`
    select id, title, description, amount, status
    from milestones
    where project_id = ${project.id}
    order by created_at asc
  `;

  const milestoneIds = milestones.map((milestone) => milestone.id);
  const images = milestoneIds.length
    ? await sql<{
        id: string;
        milestone_id: string;
        blob_url: string;
        file_name: string;
      }>`
        select id, milestone_id, blob_url, file_name
        from milestone_images
        where milestone_id = any(${milestoneIds})
        order by created_at asc
      `
    : [];

  const imagesByMilestone = images.reduce<Record<string, typeof images>>((acc, image) => {
    if (!acc[image.milestone_id]) acc[image.milestone_id] = [];
    acc[image.milestone_id].push(image);
    return acc;
  }, {});

  const completedCount = milestones.filter((milestone) => milestone.status === "APPROVED").length;
  const progressPercent =
    milestones.length === 0 ? 0 : Math.round((completedCount / milestones.length) * 100);
  const nextMilestone = milestones.find((milestone) => milestone.status !== "APPROVED");

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Project View</p>
          </div>
          <h1 className="heading-lg mb-3">{project.title}</h1>
          <p className="text-[var(--text-muted)]">
            Designer: {project.firm_name ?? "—"} • Status: {project.status}
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-8">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="eyebrow mb-1">Overall progress</p>
                <p className="heading-md mb-1">{progressPercent}% complete</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Current phase: {nextMilestone?.title ?? "All milestones approved"}
                </p>
              </div>
              <div className="text-right text-xs text-[var(--text-muted)]">
                Next payment milestone: {nextMilestone?.title ?? "None pending"}
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--border)]">
              <div
                className="h-2 rounded-full bg-[var(--brand)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <h2 className="heading-md mb-6">Live tracker · Milestones</h2>
          {milestones.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No milestones yet.</p>
          ) : (
            <StaggerChildren className="space-y-6">
              {milestones.map((milestone) => (
                <FadeInItem key={milestone.id}>
                  <div className="card">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="eyebrow mb-1">{milestone.status}</p>
                        <h3 className="heading-md">{milestone.title}</h3>
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        ₹{milestone.amount.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-[var(--text-muted)] mb-4">{milestone.description}</p>
                    {milestone.status === "SUBMITTED" && imagesByMilestone[milestone.id]?.length ? (
                      <div className="mb-6">
                        <BeforeAfterSlider images={imagesByMilestone[milestone.id]} />
                      </div>
                    ) : imagesByMilestone[milestone.id]?.length ? (
                      <div className="grid gap-2 md:grid-cols-2 mb-4">
                        {imagesByMilestone[milestone.id].map((image) => (
                          <a
                            key={image.id}
                            href={image.blob_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-[var(--border)] p-3 text-xs text-[var(--text-muted)] hover:border-[var(--border-strong)] transition-colors"
                          >
                            {image.file_name}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {milestone.status === "SUBMITTED" && (
                      <div className="rounded-xl border-2 border-[var(--brand)]/30 bg-[var(--brand-light)]/20 p-6">
                        <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Ready for your approval</p>
                        <p className="text-sm text-[var(--text-muted)] mb-4">
                          Review the evidence above. Approve & pay to release funds to escrow.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <ApproveMilestonePay
                            milestoneId={milestone.id}
                            amount={milestone.amount}
                            title={milestone.title}
                          />
                          <button type="button" className="btn btn-secondary">
                            Raise issue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </FadeInItem>
              ))}
            </StaggerChildren>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
