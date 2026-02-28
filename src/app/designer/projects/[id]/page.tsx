import {
  createMilestoneAction,
  deleteMilestoneImageAction,
  initiateProjectAction,
  submitMilestoneAction,
  updateMilestoneDescriptionAction,
  uploadMilestoneImageAction,
} from "@/app/actions/project";
import MilestoneTimeline from "@/components/ui/MilestoneTimeline";
import PageTabs from "@/components/ui/PageTabs";
import AddMilestoneModal from "@/components/designer/AddMilestoneModal";
import AddMilestonePhotoForm from "@/components/designer/AddMilestonePhotoForm";
import { Plus, FileText, Image, Package, Trash2, HelpCircle, ClipboardList } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

export default async function FirmProjectPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const tabParam = resolvedSearchParams?.tab;
  const tab = tabParam === "approved" ? "approved" : tabParam === "submitted" ? "submitted" : "in-progress";
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

  const inProgressMilestones = milestones.filter(
    (m) => m.status === "PENDING" || m.status === "IN_PROGRESS"
  );
  const submittedMilestones = milestones.filter((m) => m.status === "SUBMITTED");
  const approvedMilestones = milestones.filter((m) => m.status === "APPROVED");
  const milestoneTabs = [
    {
      label: "In progress",
      href: `/designer/projects/${id}?tab=in-progress`,
      active: tab === "in-progress",
      count: inProgressMilestones.length,
    },
    {
      label: "Submitted",
      href: `/designer/projects/${id}?tab=submitted`,
      active: tab === "submitted",
      count: submittedMilestones.length,
    },
    {
      label: "Approved",
      href: `/designer/projects/${id}?tab=approved`,
      active: tab === "approved",
      count: approvedMilestones.length,
    },
  ];
  const displayedMilestones =
    tab === "approved"
      ? approvedMilestones
      : tab === "submitted"
        ? submittedMilestones
        : inProgressMilestones;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <p className="eyebrow text-[var(--text-muted)] mb-1">
            {project.customer_name ?? project.customer_email} · {project.status}
          </p>
          <h1 className="heading-lg mb-1">{project.title}</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Add payment stages below. Customer approves each stage; you get paid after admin releases from escrow.
          </p>
        </FadeIn>

        {(project.status === "LEAD" || project.status === "ACCEPTED") && (
          <FadeIn delay={0.05} className="mb-8">
            <div className="rounded-xl border-2 border-[var(--accent-amber)]/50 bg-[var(--accent-amber)]/5 p-6">
              <p className="text-sm text-[var(--foreground)] mb-4">
                {project.status === "LEAD"
                  ? "The customer requested a meetup. Once you agree to work together, start the project to add payment stages and get paid."
                  : "You've accepted. Start the project to add milestones and request payments."}
              </p>
              <form action={initiateProjectAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <button type="submit" className="btn btn-primary inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Start project &amp; add milestones
                </button>
              </form>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.08} className="mb-8">
          <h2 className="heading-md mb-1">Payment stages</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Each stage is a billable milestone. Add it, attach 1–3 photos as evidence, then submit for approval. The customer approves and pays; admin releases funds to you.
          </p>

          {project.status === "ACTIVE" ? (
            <>
              <div className="mb-6">
                <AddMilestoneModal projectId={project.id} action={createMilestoneAction} />
              </div>

              {milestones.length === 0 ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/30 p-8 text-center">
                  <p className="text-[var(--text-muted)] mb-1">No payment stages yet</p>
                  <p className="text-sm text-[var(--text-muted)]">Open &quot;Add milestone&quot; above to create your first one.</p>
                </div>
              ) : (
            <>
              <PageTabs tabs={milestoneTabs} />
              {displayedMilestones.length === 0 ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/30 p-8 text-center">
                  <p className="text-[var(--text-muted)] mb-1">
                    {tab === "approved"
                      ? "No approved stages yet"
                      : tab === "submitted"
                        ? "No stages awaiting approval"
                        : "No stages in progress"}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {tab === "approved"
                      ? "Stages you submit for approval will appear here once the customer approves."
                      : tab === "submitted"
                        ? "Stages you submit for approval appear here until the customer approves or disputes."
                        : "Add a milestone above or move one back to in progress."}
                  </p>
                </div>
              ) : (
            <StaggerChildren className="space-y-4">
              {displayedMilestones.map((milestone) => (
                <FadeInItem key={milestone.id}>
                  <div className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="eyebrow mb-1">
                          {milestone.status === "SUBMITTED" ? "Awaiting customer approval" : milestone.status.replace(/_/g, " ")}
                        </p>
                        <h3 className="heading-md">{milestone.title}</h3>
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        ₹{milestone.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-1">Description</p>
                      {(milestone.status === "IN_PROGRESS" || milestone.status === "PENDING") ? (
                        <form action={updateMilestoneDescriptionAction}>
                          <input type="hidden" name="milestoneId" value={milestone.id} />
                          <textarea
                            name="description"
                            rows={2}
                            defaultValue={milestone.description}
                            className="input w-full text-sm"
                            placeholder="What this stage includes"
                          />
                          <button type="submit" className="btn btn-ghost text-xs mt-1 text-[var(--brand)]">
                            Save description
                          </button>
                        </form>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]">{milestone.description || "—"}</p>
                      )}
                    </div>

                    <div className="mb-4 pt-3 border-t border-[var(--border)]">
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                        Evidence — {(imagesByMilestone[milestone.id]?.length ?? 0)} of {MAX_IMAGES} photos
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mb-2">
                        Add 1–3 photos for the customer to review. They approve and pay this stage after you submit.
                      </p>
                      {imagesByMilestone[milestone.id]?.length > 0 && (
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 mb-3">
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
                                  <button type="submit" className="p-1.5 rounded text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]" title="Remove">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {(milestone.status === "PENDING" || milestone.status === "IN_PROGRESS") &&
                        (imagesByMilestone[milestone.id]?.length ?? 0) < MAX_IMAGES && (
                          <AddMilestonePhotoForm
                            milestoneId={milestone.id}
                            action={uploadMilestoneImageAction}
                          />
                        )}
                    </div>

                    {(milestone.status === "PENDING" || milestone.status === "IN_PROGRESS") && (() => {
                      const count = imagesByMilestone[milestone.id]?.length ?? 0;
                      const canSubmit = count >= 1 && count <= MAX_IMAGES;
                      return canSubmit ? (
                        <form action={submitMilestoneAction} className="mb-4">
                          <input type="hidden" name="milestoneId" value={milestone.id} />
                          <button type="submit" className="btn btn-primary">
                            Submit for approval
                          </button>
                        </form>
                      ) : (
                        <p className="text-xs text-[var(--accent-amber)] mb-4">
                          Add at least 1 photo (max {MAX_IMAGES}) to submit this stage for approval.
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
            </>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/30 p-6">
              <p className="text-sm text-[var(--text-muted)]">
                {project.status === "REJECTED"
                  ? "This project was rejected."
                  : "Start the project first (use the button above when the project is a lead or accepted) to add payment stages."}
              </p>
            </div>
          )}
        </FadeIn>

        {project.status === "ACTIVE" && (
          <FadeIn delay={0.12} className="mt-12 pt-10 border-t border-[var(--border)]">
            <h2 className="heading-md mb-2 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[var(--text-muted)]" />
              Common questions
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Quick answers about design revisions, quotes, site photos, and handover. For anything you charge for, use a payment stage above.
            </p>
            <div className="space-y-4">
              <details className="group rounded-xl border border-[var(--border)] bg-white overflow-hidden">
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-subtle)]/50 flex items-center gap-3">
                  <Image className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                  How do I share design revisions or moodboards?
                </summary>
                <div className="px-5 pb-4 pt-3 text-sm text-[var(--text-muted)] border-t border-[var(--border)] leading-relaxed">
                  Share files with the customer for feedback anytime (no payment). To bill for a design phase, create a payment stage (e.g. &quot;Concept Design&quot;), add 1–3 photos as evidence, then submit for approval.
                </div>
              </details>
              <details className="group rounded-xl border border-[var(--border)] bg-white overflow-hidden">
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-subtle)]/50 flex items-center gap-3">
                  <FileText className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                  Where do I add my quotation?
                </summary>
                <div className="px-5 pb-4 pt-3 text-sm text-[var(--text-muted)] border-t border-[var(--border)] leading-relaxed">
                  Create payment stages that match your quote amounts. The customer approves and pays each stage. Quotation PDF upload for this project is coming soon.
                </div>
              </details>
              <details className="group rounded-xl border border-[var(--border)] bg-white overflow-hidden">
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-subtle)]/50 flex items-center gap-3">
                  <ClipboardList className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                  Where do site photos and progress updates go?
                </summary>
                <div className="px-5 pb-4 pt-3 text-sm text-[var(--text-muted)] border-t border-[var(--border)] leading-relaxed">
                  Add them to the right payment stage (e.g. &quot;Carpentry &amp; finishing&quot;). Add photos as evidence for that stage, then click Submit for approval. The customer pays for that stage.
                </div>
              </details>
              <details className="group rounded-xl border border-[var(--border)] bg-white overflow-hidden">
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-subtle)]/50 flex items-center gap-3">
                  <Package className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                  What about handover documents (Digital Twin)?
                </summary>
                <div className="px-5 pb-4 pt-3 text-sm text-[var(--text-muted)] border-t border-[var(--border)] leading-relaxed">
                  Final as-built drawings, warranties, and manuals go to the customer&apos;s Digital Twin vault (Customer → Digital Twin). Designer upload for this project is coming soon.
                </div>
              </details>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
