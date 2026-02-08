import { Cuboid, FolderOpen, ImageIcon } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DigitalTwinPage() {
  const user = await requireCustomerPaid();

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
    project_title: string;
    milestone_title: string;
  }>`
    select mi.id, p.id as project_id, mi.blob_url, mi.file_name, p.title as project_title, m.title as milestone_title
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

  const projectIdsWithContent = new Set<string>();
  imagesByProject.forEach((_, projectId) => projectIdsWithContent.add(projectId));
  filesByProject.forEach((_, projectId) => projectId != null && projectIdsWithContent.add(projectId));
  const projectsToShow = projects.filter((p) => projectIdsWithContent.has(p.id));
  const unassignedFiles = filesByProject.get(null) ?? [];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Cuboid className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Digital Twin</p>
        </div>
        <h1 className="heading-lg mb-1">Documents by Project</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Milestone photos and documents for each project. Files stay available after completion.
        </p>
      </header>

      {projectsToShow.length === 0 && unassignedFiles.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--text-muted)]">
          No documents yet. Milestone photos and uploaded files will appear here by project.
        </div>
      ) : (
        <div className="space-y-8">
          {projectsToShow.map((project) => {
            const images = imagesByProject.get(project.id) ?? [];
            const files = filesByProject.get(project.id) ?? [];
            const hasAny = images.length > 0 || files.length > 0;
            if (!hasAny) return null;

            return (
              <div key={project.id} className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h2 className="font-semibold text-[var(--foreground)]">{project.title}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Project documents</p>
                </div>
                <div className="p-4 space-y-6">
                  {images.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
                        <h3 className="text-sm font-medium text-[var(--foreground)]">Milestone photos</h3>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {images.map((img) => (
                          <a
                            key={img.id}
                            href={img.blob_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-lg border border-[var(--border)] p-3 hover:border-[var(--border-strong)] transition-colors"
                          >
                            <p className="text-xs text-[var(--text-muted)] truncate mb-1">{img.milestone_title}</p>
                            <p className="text-sm font-medium text-[var(--foreground)] truncate">{img.file_name}</p>
                            <span className="text-xs text-[var(--brand)]">Open</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {files.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FolderOpen className="h-4 w-4 text-[var(--text-muted)]" />
                        <h3 className="text-sm font-medium text-[var(--foreground)]">Documents</h3>
                      </div>
                      <ul className="divide-y divide-[var(--border)]">
                        {files.map((f) => (
                          <li key={f.id}>
                            <a
                              href={f.blob_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between py-2.5 text-sm hover:bg-[var(--surface-subtle)] transition-colors px-2 -mx-2 rounded-lg"
                            >
                              <span className="text-[var(--foreground)] truncate">{f.file_name}</span>
                              <span className="text-xs font-medium text-[var(--brand)] shrink-0">Download</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {unassignedFiles.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-[var(--text-muted)]" />
                <h2 className="font-semibold text-[var(--foreground)]">Other documents</h2>
              </div>
              <ul className="divide-y divide-[var(--border)]">
                {unassignedFiles.map((f) => (
                  <li key={f.id}>
                    <a
                      href={f.blob_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between py-3 text-sm hover:bg-[var(--surface-subtle)] transition-colors px-4 rounded-lg"
                    >
                      <span className="text-[var(--foreground)] truncate">{f.file_name}</span>
                      <span className="text-xs font-medium text-[var(--brand)] shrink-0">Download</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
