import {
  createMilestoneAction,
  deleteMilestoneImageAction,
  initiateProjectAction,
  submitMilestoneAction,
  updateMilestoneDescriptionAction,
  uploadMilestoneImageAction,
} from "@/app/actions/project";
import MilestoneTimeline from "@/components/ui/MilestoneTimeline";
import { ClipboardList, Info, IndianRupee, FileText, Image, Package, Trash2 } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function FirmProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireFirmPaid();

  const [project] = await sql<{
    id: string;
    title: string;
    status: string;
    customer_name: string | null;
    customer_email: string;
  }>`
    select p.id, p.title, p.status, u.name as customer_name, u.email as customer_email
    from projects p
    join users u on u.id = p.customer_id
    where p.id = ${id} and p.firm_id = ${user.id}
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

  const MAX_IMAGES = 3;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Project Management</p>
          </div>
          <h1 className="heading-lg mb-3">{project.title}</h1>
          <p className="text-[var(--text-muted)]">
            Customer: {project.customer_name ?? project.customer_email} • Status: {project.status}
          </p>
        </FadeIn>

        {(project.status === "LEAD" || project.status === "ACCEPTED") && (
          <FadeIn delay={0.08}>
            <div className="card border-[var(--accent-amber)]/40 bg-[var(--accent-amber-light)]/30 mb-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                {project.status === "LEAD" ? "This is a lead" : "Project accepted"}
              </h3>
              <p className="text-sm text-[var(--foreground)] mb-2">
                {project.status === "LEAD"
                  ? "The customer requested a meetup with you. After you meet (or agree to work together), click Initiate project below to start adding milestones."
                  : "You’ve accepted this project. Click Initiate project below to move it to Active and add milestones and request payments."}
              </p>
              <form action={initiateProjectAction} className="mt-3">
                <input type="hidden" name="projectId" value={project.id} />
                <button type="submit" className="btn btn-primary">
                  Initiate project
                </button>
              </form>
            </div>
          </FadeIn>
        )}

        {project.status === "ACTIVE" && (
          <FadeIn delay={0.08} className="mb-8">
            <div className="card border-[var(--brand)]/20 bg-[var(--surface-subtle)]/50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">How this project works</h3>
                  <ul className="text-sm text-[var(--text-muted)] space-y-2 list-disc list-inside">
                    <li><strong className="text-[var(--foreground)]">Lead → Active:</strong> Customer requested a meetup (lead). You turned it into an active project by clicking &quot;Initiate project&quot;. You can now create milestones and get paid.</li>
                    <li><strong className="text-[var(--foreground)]">Payment (milestones only):</strong> Create a milestone (e.g. Concept Design ₹65,000). Upload evidence photos, then click &quot;Request approval&quot;. The customer sees it in their project and clicks &quot;Approve &amp; pay&quot;. Money goes to escrow; Admin releases it to you from Admin → Payments.</li>
                    <li><strong className="text-[var(--foreground)]">No payment:</strong> Design revisions (moodboards for feedback), quotation PDF (for records), and Digital Twin (final handover docs) do not trigger payment. Use milestones above for any billable stage.</li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.12} className="mb-8">
          {project.status === "ACTIVE" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="heading-md">1. Create a milestone</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand)]/15 text-[var(--brand)] px-2.5 py-0.5 text-xs font-medium">
                  <IndianRupee className="h-3.5 w-3.5" /> Payment
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Each milestone is a payment stage. Add title, amount, and description. Then upload evidence and request approval; the customer approves &amp; pays from their project page. Admin releases from escrow to you.
              </p>
              <form action={createMilestoneAction} className="card space-y-4">
                <input type="hidden" name="projectId" value={project.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Milestone title</label>
                    <input name="title" required className="input" placeholder="e.g. Concept Design" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Amount (INR)</label>
                    <input name="amount" type="number" min={0} required className="input" placeholder="65000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Description</label>
                  <textarea name="description" rows={3} className="input" placeholder="What this stage includes" />
                </div>
                <button type="submit" className="btn btn-primary">
                  Add milestone
                </button>
              </form>
            </div>
          ) : (
            <div className="card text-[var(--text-muted)]">
              <p className="text-sm">
                {project.status === "REJECTED"
                  ? "This project was rejected."
                  : "Create milestones after initiating this project (status must be Active)."}
              </p>
            </div>
          )}
        </FadeIn>

        <FadeIn delay={0.18} className="mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <h2 className="heading-md">2. Milestones</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand)]/15 text-[var(--brand)] px-2.5 py-0.5 text-xs font-medium">
              <IndianRupee className="h-3.5 w-3.5" /> Payment
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Upload evidence photos for each milestone, then click &quot;Request approval&quot;. Customer sees it under their project and approves &amp; pays. You get paid after Admin releases from Admin → Payments.
          </p>
          {milestones.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No milestones created yet.</p>
          ) : (
            <StaggerChildren className="space-y-4">
              {milestones.map((milestone) => (
                <FadeInItem key={milestone.id}>
                  <div className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="eyebrow mb-1">{milestone.status}</p>
                        <h3 className="heading-md">{milestone.title}</h3>
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        ₹{milestone.amount.toLocaleString()}
                      </p>
                    </div>
                    {(milestone.status === "IN_PROGRESS" || milestone.status === "PENDING") && (
                      <form action={updateMilestoneDescriptionAction} className="mb-4">
                        <input type="hidden" name="milestoneId" value={milestone.id} />
                        <label className="text-sm font-medium text-[var(--foreground)] block mb-1">Description</label>
                        <textarea
                          name="description"
                          rows={3}
                          defaultValue={milestone.description}
                          className="input w-full"
                          placeholder="What this stage includes"
                        />
                        <button type="submit" className="btn btn-secondary text-xs mt-2">
                          Update description
                        </button>
                      </form>
                    )}
                    {!(milestone.status === "IN_PROGRESS" || milestone.status === "PENDING") && (
                      <p className="text-[var(--text-muted)] mb-4">{milestone.description}</p>
                    )}

                    {imagesByMilestone[milestone.id]?.length ? (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                          Images ({imagesByMilestone[milestone.id].length}/{MAX_IMAGES})
                        </p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {imagesByMilestone[milestone.id].map((image) => (
                            <div
                              key={image.id}
                              className="flex items-center gap-2 rounded-lg border border-[var(--border)] p-2 bg-[var(--surface-subtle)]/30"
                            >
                              <a
                                href={image.blob_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 min-w-0 text-xs text-[var(--brand)] hover:underline truncate"
                              >
                                {image.file_name}
                              </a>
                              {(milestone.status === "PENDING" || milestone.status === "IN_PROGRESS") && (
                                <form action={deleteMilestoneImageAction} className="shrink-0">
                                  <input type="hidden" name="imageId" value={image.id} />
                                  <button
                                    type="submit"
                                    className="p-1.5 rounded text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                                    title="Remove image"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {(milestone.status === "PENDING" || milestone.status === "IN_PROGRESS") && (
                      <div className="flex flex-wrap gap-3 mb-4">
                        {(imagesByMilestone[milestone.id]?.length ?? 0) < MAX_IMAGES && (
                          <form action={uploadMilestoneImageAction} encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="milestoneId" value={milestone.id} />
                            <input
                              type="file"
                              name="file"
                              accept="image/*"
                              required
                              className="block w-full max-w-[200px] text-sm text-[var(--text-muted)] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[var(--brand)] file:text-white file:cursor-pointer hover:file:opacity-90"
                            />
                            <button type="submit" className="btn btn-secondary text-xs">
                              Upload image
                            </button>
                          </form>
                        )}
                        <span className="text-xs text-[var(--text-muted)] self-center">
                          {(imagesByMilestone[milestone.id]?.length ?? 0)} / {MAX_IMAGES} images
                        </span>
                      </div>
                    )}

                    {(milestone.status === "PENDING" || milestone.status === "IN_PROGRESS") && (() => {
                      const imageCount = imagesByMilestone[milestone.id]?.length ?? 0;
                      const canSubmit = imageCount >= 1 && imageCount <= MAX_IMAGES;
                      return canSubmit ? (
                        <form action={submitMilestoneAction} className="mb-4">
                          <input type="hidden" name="milestoneId" value={milestone.id} />
                          <button type="submit" className="btn btn-primary text-xs">
                            Request approval
                          </button>
                        </form>
                      ) : (
                        <p className="text-xs text-[var(--accent-amber)] mb-4">
                          Upload at least one image (max {MAX_IMAGES}) to request approval.
                        </p>
                      );
                    })()}

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

        {project.status === "ACTIVE" && (
          <FadeIn delay={0.24} className="mt-8">
            <h2 className="heading-md mb-3">3. Other steps (no payment)</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              These steps support the project but do not trigger payment. Use <strong>Milestones</strong> above for any billable stage.
            </p>
            <div className="space-y-4">
              <div className="card border-[var(--border)]">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                    <Image className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Design revision</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Share moodboards or layout options with the customer for feedback. No payment. When you are ready to bill for a design phase, create a milestone (e.g. &quot;Concept Design&quot;), upload the design files as milestone evidence, then request approval.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card border-[var(--border)]">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Quotation</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Your formal quote (PDF) for the customer&apos;s records. Create milestones above to match the quote amounts. Quotation upload for this project is coming soon; for now, create milestones that reflect your quote.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card border-[var(--border)]">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                    <ClipboardList className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Execution / site progress</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Site photos and progress updates go in <strong>Milestones</strong> above. Upload images to the relevant milestone (e.g. &quot;Carpentry &amp; finishing&quot;), then click &quot;Request approval&quot; when that stage is complete. The customer approves and pays for that milestone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card border-[var(--border)]">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                    <Package className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Digital Twin (handover)</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Final handover documents (as-built drawings, warranties, manuals) go to the customer&apos;s Digital Twin vault. They see these under Customer → Digital Twin. Designer upload to vault for this project is coming soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
