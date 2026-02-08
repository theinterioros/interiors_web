import { updateFirmProfileAction, uploadFirmPortfolioAction, savePortfolioWorkAction } from "@/app/actions/designer";
import { Building2 } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FirmProfilePage() {
  const user = await requireFirmPaid();

  const [profile] = await sql<{
    id: string;
    name: string;
    firm_name: string | null;
    owner_name: string | null;
    office_address: string | null;
    gst: string | null;
    business_type: string | null;
    ticket_size: string | null;
    designers_count: number | null;
    comments: string | null;
    experience_years: number;
    city: string;
    pincode: string;
    about: string;
    google_review_links: string | null;
    status: string;
    platform_margin_pct: number | null;
    margin_accepted_at: Date | null;
  }>`
    select id, name, firm_name, owner_name, office_address, gst, business_type, ticket_size,
           designers_count, comments, experience_years, city, pincode, about,
           google_review_links, status, platform_margin_pct, margin_accepted_at
    from firm_profiles
    where user_id = ${user.id}
    limit 1
  `;

  type PortfolioRow = { id: string; work_id: string | null; blob_url: string; file_name: string };
  let portfolio: PortfolioRow[] = [];
  if (profile) {
    try {
      portfolio = await sql<PortfolioRow>`
        select id, work_id, blob_url, file_name
        from firm_portfolio_files
        where profile_id = ${profile.id}
        order by created_at desc
      `;
    } catch {
      const flat = await sql<{ id: string; blob_url: string; file_name: string }>`
        select id, blob_url, file_name
        from firm_portfolio_files
        where profile_id = ${profile.id}
        order by created_at desc
      `;
      portfolio = flat.map((f) => ({ ...f, work_id: null }));
    }
  }

  let works: { id: string; title: string; description: string | null; display_order: number }[] = [];
  try {
    works = profile
      ? await sql<{ id: string; title: string; description: string | null; display_order: number }>`
          select id, title, description, display_order
          from firm_portfolio_works
          where profile_id = ${profile.id}
          order by display_order
        `
      : [];
  } catch {
    // table may not exist
  }

  const filesByWorkId = new Map<string, typeof portfolio>();
  for (const f of portfolio) {
    if (f.work_id) {
      if (!filesByWorkId.has(f.work_id)) filesByWorkId.set(f.work_id, []);
      filesByWorkId.get(f.work_id)!.push(f);
    }
  }

  const registrationPortfolio =
    profile
      ? await sql<{ id: string; blob_url: string; file_name: string }>`
          select id, blob_url, file_name
          from firm_documents
          where profile_id = ${profile.id} and doc_type = 'portfolio'
          order by created_at desc
        `
      : [];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Profile</p>
        </div>
        <h1 className="heading-lg mb-1">Manage Your Profile</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Update your details and upload portfolio for customers to view.
        </p>
      </header>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <form action={updateFirmProfileAction} className="p-5 sm:p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Firm Name</label>
              <input name="firmName" defaultValue={profile?.firm_name ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Owner Name</label>
              <input name="ownerName" defaultValue={profile?.owner_name ?? ""} className="input" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Name</label>
              <input name="name" defaultValue={profile?.name ?? ""} required className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Experience (Years)</label>
              <input
                name="experienceYears"
                type="number"
                min={0}
                defaultValue={profile?.experience_years ?? 0}
                required
                className="input"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">City</label>
              <input name="city" defaultValue={profile?.city ?? ""} required className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Pincode</label>
              <input name="pincode" defaultValue={profile?.pincode ?? ""} required className="input" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Office Address</label>
            <input name="officeAddress" defaultValue={profile?.office_address ?? ""} className="input" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">GST</label>
              <input name="gst" defaultValue={profile?.gst ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Business Type</label>
              <input name="businessType" defaultValue={profile?.business_type ?? ""} className="input" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Ticket Size</label>
              <input name="ticketSize" defaultValue={profile?.ticket_size ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Designers Count</label>
              <input
                name="designersCount"
                type="number"
                min={0}
                defaultValue={profile?.designers_count ?? 0}
                className="input"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">About (Bio)</label>
            <textarea name="about" rows={4} defaultValue={profile?.about ?? ""} required className="input" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Google Review Links</label>
            <textarea
              name="googleReviewLinks"
              rows={2}
              defaultValue={profile?.google_review_links ?? ""}
              className="input"
              placeholder="One URL per line (e.g. Google Business profile)"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Comments</label>
            <textarea name="comments" rows={3} defaultValue={profile?.comments ?? ""} className="input" />
          </div>
          <button type="submit" className="btn btn-primary">
            Save Profile
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">Portfolio Works</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Max 3 works, 3 images each</p>
          </div>
          <div className="p-5 space-y-6">
              {[0, 1, 2].map((order) => {
                const work = works.find((w) => w.display_order === order);
                const workFiles = work ? filesByWorkId.get(work.id) ?? [] : [];
                return (
                  <div key={order} className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]/30 p-4 space-y-4">
                    <h3 className="font-semibold text-[var(--foreground)]">Work {order + 1}</h3>
                    <form action={savePortfolioWorkAction} className="space-y-3">
                      <input type="hidden" name="workOrder" value={order} />
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input name="title" defaultValue={work?.title ?? ""} placeholder="e.g. Living room makeover" className="input w-full" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" rows={2} defaultValue={work?.description ?? ""} placeholder="Brief description" className="input w-full" />
                      </div>
                      <button type="submit" className="btn btn-secondary">Save Work</button>
                    </form>
                    {work && workFiles.length < 3 && (
                      <form action={uploadFirmPortfolioAction} className="flex flex-wrap items-end gap-3 pt-2 border-t border-[var(--border)]">
                        <input type="hidden" name="workId" value={work.id} />
                        <input type="file" name="file" required accept="image/*" className="input flex-1 min-w-0" />
                        <button type="submit" className="btn btn-secondary">Add Image ({workFiles.length}/3)</button>
                      </form>
                    )}
                    {work && workFiles.length > 0 && (
                      <div className="text-sm">
                        <span className="text-[var(--text-muted)]">Images: </span>
                        {workFiles.map((f) => (
                          <a key={f.id} href={f.blob_url} target="_blank" rel="noreferrer" className="text-[var(--brand)] hover:underline mr-2">
                            {f.file_name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 px-5 pb-5">For each work: enter title and description, save, then add up to 3 images.</p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">Portfolio Uploads</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Add PDF or images for customers to view. For curated projects with titles and descriptions, use Portfolio Works above.</p>
          </div>
          {registrationPortfolio.length > 0 && (
            <div className="p-5 border-b border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">Portfolio from registration</p>
              <div className="space-y-2 text-sm">
                {registrationPortfolio.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.blob_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[var(--brand)] hover:underline"
                  >
                    {doc.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}
          <form
            action={uploadFirmPortfolioAction}
            className="p-5 space-y-4"
          >
            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Upload Portfolio File</span>
              <input type="file" name="file" required className="input mt-1 block w-full max-w-sm" accept="image/*,.pdf" />
            </label>
            <button type="submit" className="btn btn-secondary">
              Upload
            </button>
            {portfolio.filter((f) => !f.work_id).length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Uploaded Files (Not Linked to a Work)</p>
                <div className="space-y-2 text-sm">
                  {portfolio.filter((f) => !f.work_id).map((file) => (
                    <a
                      key={file.id}
                      href={file.blob_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[var(--brand)] hover:underline"
                    >
                      {file.file_name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </form>
      </div>
    </div>
  );
}
