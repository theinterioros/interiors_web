import { Cuboid, FolderOpen, ImageIcon } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function DigitalTwinPage() {
  const user = await requireCustomerPaid();

  const milestoneImages = await sql<{
    id: string;
    blob_url: string;
    file_name: string;
    project_title: string;
    milestone_title: string;
  }>`
    select mi.id, mi.blob_url, mi.file_name, p.title as project_title, m.title as milestone_title
    from milestone_images mi
    join milestones m on m.id = mi.milestone_id
    join projects p on p.id = m.project_id
    where p.customer_id = ${user.id}
    order by mi.created_at desc
  `;

  const twinFiles = await sql<{
    id: string;
    blob_url: string;
    file_name: string;
    category: string;
  }>`
    select id, blob_url, file_name, category
    from digital_twin_files
    where customer_id = ${user.id}
    order by created_at desc
  `;

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Cuboid className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Digital Twin</p>
          </div>
          <h1 className="heading-lg mb-3">Vault & documents</h1>
          <p className="text-[var(--text-muted)]">
            Milestone photos and uploaded documents. Accessible for all your projects, including completed ones.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="mb-8">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-[var(--brand)]" />
              <h2 className="heading-md">Milestone photos</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Every image uploaded by your designer to a milestone appears here. Files remain available after project completion.
            </p>
            {milestoneImages.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No milestone photos yet.</p>
            ) : (
              <StaggerChildren className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {milestoneImages.map((img) => (
                  <FadeInItem key={img.id}>
                    <a
                      href={img.blob_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-[var(--border)] p-3 hover:border-[var(--border-strong)] transition-colors"
                    >
                      <p className="text-xs text-[var(--text-muted)] truncate mb-1">{img.project_title} → {img.milestone_title}</p>
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{img.file_name}</p>
                      <span className="text-xs text-[var(--brand)] hover:underline">Open / Download</span>
                    </a>
                  </FadeInItem>
                ))}
              </StaggerChildren>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-8">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="h-5 w-5 text-[var(--brand)]" />
              <h2 className="heading-md">Uploaded documents</h2>
            </div>
            {twinFiles.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No documents uploaded yet.</p>
            ) : (
              <StaggerChildren className="space-y-2">
                {twinFiles.map((f) => (
                  <FadeInItem key={f.id}>
                    <a
                      href={f.blob_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 text-sm"
                    >
                      <span className="text-[var(--text-muted)]">{f.file_name}</span>
                      <span className="text-xs font-semibold text-[var(--brand)] hover:underline">Download</span>
                    </a>
                  </FadeInItem>
                ))}
              </StaggerChildren>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="card">
            <h2 className="heading-md mb-4">3D model viewer</h2>
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] text-sm text-[var(--text-muted)]">
              Room-wise 3D view placeholder
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
