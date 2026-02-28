import Link from "next/link";
import { Cuboid, Calendar, FolderOpen, ImageIcon, Upload, IndianRupee } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import { uploadDigitalTwinFileAction } from "@/app/actions/digitalTwin";
import { getAdminSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function DigitalTwinPage() {
  const user = await requireCustomerPaid();

  const [subscription] = await sql<{ expires_at: Date }>`
    select expires_at from digital_twin_subscriptions where customer_id = ${user.id} limit 1
  `;
  const settings = await getAdminSettings();
  const twinFee = settings.digitalTwinYearlyFee ?? 1000;
  const expiresAt = subscription ? new Date(subscription.expires_at) : null;
  const isTwinActive = expiresAt ? expiresAt > new Date() : false;
  const hasSubscription = !!subscription;
  const isExpiringSoon = expiresAt && expiresAt > new Date() && expiresAt.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

  const projects = await sql<{ id: string; title: string }>`
    select id, title
    from projects
    where customer_id = ${user.id}
    order by created_at desc
  `;

  const milestoneImages = await sql<{
    id: string;
    project_id: string;
    blob_url: string;
    file_name: string;
    mime_type: string;
    project_title: string;
    milestone_title: string;
  }>`
    select mi.id, p.id as project_id, mi.blob_url, mi.file_name, mi.mime_type, p.title as project_title, m.title as milestone_title
    from milestone_images mi
    join milestones m on m.id = mi.milestone_id
    join projects p on p.id = m.project_id
    where p.customer_id = ${user.id}
    order by mi.created_at desc
  `;

  const twinFiles = await sql<{
    id: string;
    project_id: string | null;
    blob_url: string;
    file_name: string;
    category: string;
  }>`
    select id, project_id, blob_url, file_name, category
    from digital_twin_files
    where customer_id = ${user.id}
    order by created_at desc
  `;

  const imagesByProject = new Map<string, typeof milestoneImages>([]);
  for (const img of milestoneImages) {
    const key = img.project_id;
    if (!imagesByProject.has(key)) imagesByProject.set(key, []);
    imagesByProject.get(key)!.push(img);
  }

  const filesByProject = new Map<string | null, typeof twinFiles>([]);
  for (const f of twinFiles) {
    const key = f.project_id ?? null;
    if (!filesByProject.has(key)) filesByProject.set(key, []);
    filesByProject.get(key)!.push(f);
  }

  const unassignedFiles = filesByProject.get(null) ?? [];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Cuboid className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Digital Twin</p>
        </div>
        <h1 className="heading-lg mb-1">All project files</h1>
        <p className="text-sm text-[var(--text-muted)]">
          For each project: view milestone photos and documents from your designer, and upload your own files with a name. Everything for that project in one place.
        </p>
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]/30 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Digital Twin: {!hasSubscription ? "Subscribe to upload" : isTwinActive ? `Active until ${expiresAt?.toLocaleDateString()}` : "Expired"}
            </span>
          </div>
          {(!hasSubscription || !isTwinActive || isExpiringSoon) && (
            <Link href="/customer/renew" className="btn btn-primary text-sm inline-flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              {!hasSubscription ? "Subscribe" : !isTwinActive ? "Renew subscription" : "Renew early"} (₹{twinFee.toLocaleString()}/year)
            </Link>
          )}
          {isExpiringSoon && isTwinActive && (
            <p className="text-xs text-[var(--accent-amber)] w-full">Expires in less than 30 days.</p>
          )}
        </div>
      </header>

      {projects.length === 0 && unassignedFiles.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--text-muted)]">
          No projects yet. When you start a project with a designer, it will appear here. You can upload and name files per project.
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map((project) => {
            const images = imagesByProject.get(project.id) ?? [];
            const files = filesByProject.get(project.id) ?? [];

            return (
              <div key={project.id} className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h2 className="font-semibold text-[var(--foreground)]">{project.title}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Designer deliverables and your uploads for this project</p>
                </div>
                <div className="p-4 space-y-6">
                  {/* From designer: milestone photos & documents */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
                      <h3 className="text-sm font-medium text-[var(--foreground)]">From designer (milestone photos & documents)</h3>
                    </div>
                    {images.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {images.map((img) => {
                          const isImage = (img.mime_type || "").startsWith("image/");
                          return (
                            <a
                              key={img.id}
                              href={img.blob_url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--border-strong)] transition-colors"
                            >
                              {isImage ? (
                                <img
                                  src={img.blob_url}
                                  alt={img.file_name}
                                  className="w-full aspect-[4/3] object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="block aspect-[4/3] bg-[var(--surface-subtle)]/50" />
                              )}
                              <div className="p-2">
                                <p className="text-xs text-[var(--text-muted)] truncate">{img.milestone_title}</p>
                                <p className="text-sm font-medium text-[var(--foreground)] truncate">{img.file_name}</p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">No milestone photos or documents from the designer yet.</p>
                    )}
                  </div>

                  {/* Your uploads for this project */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FolderOpen className="h-4 w-4 text-[var(--text-muted)]" />
                      <h3 className="text-sm font-medium text-[var(--foreground)]">Your uploads</h3>
                    </div>
                    {files.length > 0 && (
                      <ul className="divide-y divide-[var(--border)] mb-4">
                        {files.map((f) => (
                          <li key={f.id}>
                            <a
                              href={f.blob_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between py-2.5 text-sm hover:bg-[var(--surface-subtle)] transition-colors px-2 -mx-2 rounded-lg"
                            >
                              <span className="text-[var(--foreground)] truncate">{f.file_name}</span>
                              <span className="text-xs font-medium text-[var(--brand)] shrink-0">Open</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    <form action={uploadDigitalTwinFileAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-subtle)]/30 p-4">
                      <input type="hidden" name="projectId" value={project.id} />
                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="block text-xs font-medium text-[var(--text-muted)]">File</label>
                        <input type="file" name="file" required className="input w-full text-sm" />
                      </div>
                      <div className="w-48 sm:w-56 space-y-1">
                        <label className="block text-xs font-medium text-[var(--text-muted)]">Name this file (optional)</label>
                        <input type="text" name="fileName" maxLength={200} placeholder="e.g. Floor plan v2" className="input w-full" />
                      </div>
                      <button type="submit" className="btn btn-secondary inline-flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Other documents (no project) */}
          <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-[var(--text-muted)]" />
              <h2 className="font-semibold text-[var(--foreground)]">Other documents</h2>
            </div>
            <div className="p-4">
              <p className="text-xs text-[var(--text-muted)] mb-3">Files not tied to a specific project.</p>
              {unassignedFiles.length > 0 && (
                <ul className="divide-y divide-[var(--border)] mb-4">
                  {unassignedFiles.map((f) => (
                    <li key={f.id}>
                      <a
                        href={f.blob_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between py-2.5 text-sm hover:bg-[var(--surface-subtle)] transition-colors px-2 -mx-2 rounded-lg"
                      >
                        <span className="text-[var(--foreground)] truncate">{f.file_name}</span>
                        <span className="text-xs font-medium text-[var(--brand)] shrink-0">Open</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <form action={uploadDigitalTwinFileAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-subtle)]/30 p-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">File</label>
                  <input type="file" name="file" required className="input w-full text-sm" />
                </div>
                <div className="w-48 sm:w-56 space-y-1">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">Name this file (optional)</label>
                  <input type="text" name="fileName" maxLength={200} placeholder="e.g. Warranty card" className="input w-full" />
                </div>
                <button type="submit" className="btn btn-secondary inline-flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
