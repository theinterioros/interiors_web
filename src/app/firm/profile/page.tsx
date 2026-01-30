import { updateFirmProfileAction, uploadFirmPortfolioAction } from "@/app/actions/designer";
import { Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FirmProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

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
  }>`
    select id,
           name,
           firm_name,
           owner_name,
           office_address,
           gst,
           business_type,
           ticket_size,
           designers_count,
           comments,
           experience_years,
           city,
           pincode,
           about
    from firm_profiles
    where user_id = ${user.id}
    limit 1
  `;

  const portfolio = profile
    ? await sql<{
        id: string;
        blob_url: string;
        file_name: string;
      }>`
        select id, blob_url, file_name
        from firm_portfolio_files
        where profile_id = ${profile.id}
        order by created_at desc
      `
    : [];

  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <Building2 className="h-4 w-4 text-amber-600" />
            Firm Profile
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Manage your profile</h1>
          <p className="text-sm text-neutral-500">
            Update your details and upload portfolio documents for review.
          </p>
        </div>

        <form action={updateFirmProfileAction} className="card space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Firm name</label>
              <input
                name="firmName"
                defaultValue={profile?.firm_name ?? ""}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Owner name</label>
              <input
                name="ownerName"
                defaultValue={profile?.owner_name ?? ""}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Name</label>
              <input
                name="name"
                defaultValue={profile?.name ?? ""}
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Experience (years)</label>
              <input
                name="experienceYears"
                type="number"
                min={0}
                defaultValue={profile?.experience_years ?? 0}
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">City</label>
              <input
                name="city"
                defaultValue={profile?.city ?? ""}
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Pincode</label>
              <input
                name="pincode"
                defaultValue={profile?.pincode ?? ""}
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Office address</label>
            <input
              name="officeAddress"
              defaultValue={profile?.office_address ?? ""}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">GST</label>
              <input
                name="gst"
                defaultValue={profile?.gst ?? ""}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Business type</label>
              <input
                name="businessType"
                defaultValue={profile?.business_type ?? ""}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Ticket size</label>
              <input
                name="ticketSize"
                defaultValue={profile?.ticket_size ?? ""}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Designers count</label>
              <input
                name="designersCount"
                type="number"
                min={0}
                defaultValue={profile?.designers_count ?? 0}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">About</label>
            <textarea
              name="about"
              rows={4}
              defaultValue={profile?.about ?? ""}
              required
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Comments</label>
            <textarea
              name="comments"
              rows={3}
              defaultValue={profile?.comments ?? ""}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-md bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-amber-400 hover:to-amber-500">
            Save profile
          </button>
        </form>

        <form
          action={uploadFirmPortfolioAction}
          encType="multipart/form-data"
          className="card space-y-4"
        >
          <h2 className="text-lg font-semibold text-neutral-900">Portfolio uploads</h2>
          <input type="file" name="file" required className="text-sm" />
          <button className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800">
            Upload portfolio file
          </button>
          <div className="space-y-2 text-sm text-neutral-600">
            {portfolio.map((file) => (
              <a key={file.id} href={file.blob_url} target="_blank" rel="noreferrer" className="block underline">
                {file.file_name}
              </a>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
