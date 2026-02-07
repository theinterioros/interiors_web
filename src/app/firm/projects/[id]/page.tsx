import {
  createMilestoneAction,
  submitMilestoneAction,
  uploadMilestoneImageAction,
} from "@/app/actions/project";
import { ClipboardList } from "lucide-react";
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

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Project Management</p>
          </div>
          <h1 className="heading-lg mb-3">{project.title}</h1>
          <p className="text-[var(--text-muted)]">
            Customer: {project.customer_name ?? project.customer_email} • Status: {project.status}
          </p>
        </FadeIn>

        {project.status === "LEAD" && (
          <FadeIn delay={0.15}>
            <div className="card border-[var(--accent-amber)]/40 bg-[var(--accent-amber-light)]/30 mb-6">
              <p className="text-sm text-[var(--foreground)]">
                <strong>Lead.</strong> After the meetup, go to Dashboard or Leads and click &quot;Initiate Project&quot; to move this project to Active. Milestones can only be created for active projects.
              </p>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.2} className="mb-8">
          {project.status === "ACTIVE" ? (
            <form action={createMilestoneAction} className="card space-y-4">
              <input type="hidden" name="projectId" value={project.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Milestone title</label>
                  <input name="title" required className="input" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Amount (INR)</label>
                  <input name="amount" type="number" min={0} required className="input" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Description</label>
                <textarea name="description" rows={3} className="input" />
              </div>
              <button type="submit" className="btn btn-primary">
                Add milestone
              </button>
            </form>
          ) : (
            <div className="card text-[var(--text-muted)]">
              <p className="text-sm">Create milestones after initiating this project (status must be Active).</p>
            </div>
          )}
        </FadeIn>

        <FadeIn delay={0.3} className="mb-8">
          <h2 className="heading-md mb-6">Milestones</h2>
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
                    <p className="text-[var(--text-muted)] mb-4">{milestone.description}</p>
                    {imagesByMilestone[milestone.id]?.length ? (
                      <div className="grid gap-2 md:grid-cols-2 mb-4">
                        {imagesByMilestone[milestone.id].map((image) => (
                          <a
                            key={image.id}
                            href={image.blob_url}
                            target="_blank"
                            rel="noreferrer"
                            className="card-subtle text-xs text-[var(--text-muted)] hover:border-[var(--border-strong)] transition-colors"
                          >
                            {image.file_name}
                          </a>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <form action={uploadMilestoneImageAction} encType="multipart/form-data" className="flex gap-2">
                        <input type="hidden" name="milestoneId" value={milestone.id} />
                        <input type="file" name="file" required className="input text-xs" />
                        <button type="submit" className="btn btn-secondary text-xs">
                          Upload image
                        </button>
                      </form>
                      {milestone.status === "PENDING" && (
                        <form action={submitMilestoneAction}>
                          <input type="hidden" name="milestoneId" value={milestone.id} />
                          <button type="submit" className="btn btn-primary text-xs">
                            Request approval
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </FadeInItem>
              ))}
            </StaggerChildren>
          )}
        </FadeIn>

        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.4}>
            <form className="card space-y-4">
              <div>
                <p className="eyebrow mb-2">Design Revision</p>
                <h2 className="heading-md mb-2">Upload design updates</h2>
                <p className="text-xs text-[var(--text-muted)]">Send for customer approval in tracker.</p>
              </div>
              <input type="file" name="designFile" className="input" />
              <textarea
                name="designNotes"
                rows={3}
                placeholder="Notes for the customer"
                className="input"
              />
              <button type="button" className="btn btn-primary">
                Send for approval
              </button>
            </form>
          </FadeIn>

          <FadeIn delay={0.5}>
            <form className="card space-y-4">
              <div>
                <p className="eyebrow mb-2">Quotation Upload</p>
                <h2 className="heading-md mb-2">Submit milestone breakup</h2>
                <p className="text-xs text-[var(--text-muted)]">Attach quotation and milestone structure.</p>
              </div>
              <input type="file" name="quotationFile" className="input" />
              <div className="grid gap-3 md:grid-cols-2">
                <input placeholder="Milestone title" className="input" />
                <input placeholder="Amount (INR)" className="input" />
              </div>
              <button type="button" className="btn btn-secondary">
                Add milestone row
              </button>
              <button type="button" className="btn btn-primary">
                Submit quotation
              </button>
            </form>
          </FadeIn>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-8">
          <FadeIn delay={0.6}>
            <form className="card space-y-4">
              <div>
                <p className="eyebrow mb-2">Execution Tracker</p>
                <h2 className="heading-md mb-2">Upload site progress</h2>
                <p className="text-xs text-[var(--text-muted)]">Share photos, videos, and status updates.</p>
              </div>
              <input type="file" name="executionMedia" multiple className="input" />
              <select className="input">
                <option>Update milestone status</option>
                <option>In progress</option>
                <option>Completed</option>
                <option>Needs approval</option>
              </select>
              <button type="button" className="btn btn-primary">
                Request payment release
              </button>
            </form>
          </FadeIn>

          <FadeIn delay={0.7}>
            <form className="card space-y-4">
              <div>
                <p className="eyebrow mb-2">Digital Twin Upload</p>
                <h2 className="heading-md mb-2">Upload final documents</h2>
                <p className="text-xs text-[var(--text-muted)]">Drawings, 3D files, manuals, warranties.</p>
              </div>
              <input type="file" name="twinFiles" multiple className="input" />
              <button type="button" className="btn btn-secondary">
                Upload to vault
              </button>
            </form>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
