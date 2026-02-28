import { ClipboardList } from "lucide-react";
import ApproveMilestonePay from "@/components/customer/ApproveMilestonePay";
import BeforeAfterSlider from "@/components/customer/BeforeAfterSlider";
import MilestoneTimeline from "@/components/ui/MilestoneTimeline";
import PageBackLink from "@/components/ui/PageBackLink";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";
import RejectMilestoneForm from "@/components/customer/RejectMilestoneForm";

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
    created_at: Date;
  }>`
    select id, title, description, amount, status, created_at
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
        mime_type: string;
      }>`
        select id, milestone_id, blob_url, file_name, mime_type
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

  const trailByMilestone: Record<string, { event: string; message: string | null; created_at: Date }[]> = {};
  if (milestoneIds.length > 0) {
    const trailRows = await sql<{ milestone_id: string; event: string; message: string | null; created_at: Date }>`
      select milestone_id, event, message, created_at
      from milestone_trail
      where milestone_id = any(${milestoneIds})
      order by created_at asc
    `;
    for (const row of trailRows) {
      if (!trailByMilestone[row.milestone_id]) trailByMilestone[row.milestone_id] = [];
      trailByMilestone[row.milestone_id].push({
        event: row.event,
        message: row.message,
        created_at: row.created_at,
      });
    }
  }

  const completedCount = milestones.filter((milestone) => milestone.status === "APPROVED").length;
  const progressPercent =
    milestones.length === 0 ? 0 : Math.round((completedCount / milestones.length) * 100);
  const nextMilestone = milestones.find((milestone) => milestone.status !== "APPROVED");

  return (
    <div className="space-y-8">
      <header>
        <PageBackLink href="/customer/dashboard" label="Dashboard" />
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Project</p>
        </div>
        <h1 className="heading-lg mb-1">{project.title}</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Designer: {project.firm_name ?? "—"} · {project.status}
        </p>
        {(project.status === "LEAD" || project.status === "ACCEPTED") && (
          <p className="text-sm text-[var(--text-muted)] mt-2">
            {project.status === "LEAD"
              ? "You requested a meetup. The designer will initiate the project to start adding milestones."
              : "The designer has accepted. They will initiate the project to add milestones and request payments."}
          </p>
        )}
      </header>

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
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2">What was completed</p>
                      {milestone.description && (
                        <p className="text-[var(--text-muted)] mb-3">{milestone.description}</p>
                      )}
                      {milestone.status === "SUBMITTED" && imagesByMilestone[milestone.id]?.length ? (
                        <div className="mb-4">
                          <BeforeAfterSlider images={imagesByMilestone[milestone.id]} />
                        </div>
                      ) : imagesByMilestone[milestone.id]?.length ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {imagesByMilestone[milestone.id].map((image) => {
                            const isImage = (image.mime_type || "").startsWith("image/");
                            return (
                              <a
                                key={image.id}
                                href={image.blob_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--border-strong)] transition-colors group block"
                              >
                                {isImage ? (
                                  <img
                                    src={image.blob_url}
                                    alt={image.file_name}
                                    className="w-full aspect-[4/3] object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="block aspect-[4/3] bg-[var(--surface-subtle)]/50" />
                                )}
                                <p className="p-2 text-xs text-[var(--text-muted)] group-hover:text-[var(--foreground)] truncate" title={image.file_name}>
                                  {image.file_name}
                                </p>
                              </a>
                            );
                          })}
                        </div>
                      ) : !milestone.description && (!imagesByMilestone[milestone.id]?.length) ? (
                        <p className="text-sm text-[var(--text-muted)] italic">No deliverables recorded yet.</p>
                      ) : null}
                    </div>
                    {milestone.status === "SUBMITTED" && (
                      <div className="rounded-xl border-2 border-[var(--brand)]/30 bg-[var(--brand-light)]/20 p-6 mb-4">
                        <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Ready for your approval</p>
                        <p className="text-sm text-[var(--text-muted)] mb-4">
                          Review the evidence above. Approve &amp; pay to send the amount to escrow. The designer gets paid after Admin releases it from Admin → Payments. If something is not right, you can reject and send it back for revision.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <ApproveMilestonePay
                            milestoneId={milestone.id}
                            amount={milestone.amount}
                            title={milestone.title}
                          />
                          <RejectMilestoneForm milestoneId={milestone.id} milestoneTitle={milestone.title} />
                        </div>
                      </div>
                    )}
                    <MilestoneTimeline
                      milestoneCreatedAt={milestone.created_at}
                      trail={trailByMilestone[milestone.id] ?? []}
                    />
                  </div>
                </FadeInItem>
              ))}
            </StaggerChildren>
          )}
        </FadeIn>
    </div>
  );
}
