import { sql } from "@/lib/db";
import { BadgeCheck, Building2, Star } from "lucide-react";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { RoleValues } from "@/lib/types";
import { requestProjectAction } from "@/app/actions/project";

export const dynamic = "force-dynamic";

export default async function FirmProfilePage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser();
  const [firm] = await sql<{
    id: string;
    user_id: string;
    name: string;
    firm_name: string | null;
    owner_name: string | null;
    experience_years: number;
    city: string;
    pincode: string;
    about: string;
    status: string;
  }>`
    select id, user_id, name, firm_name, owner_name, experience_years, city, pincode, about, status
    from firm_profiles
    where id = ${params.id}
    limit 1
  `;

  if (!firm || firm.status !== "APPROVED") {
    return (
      <div className="min-h-screen bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)] px-6 py-16">
        <div className="mx-auto max-w-3xl text-sm text-neutral-500">
          Firm not found or not approved yet.
        </div>
      </div>
    );
  }

  const portfolio = await sql<{
    id: string;
    blob_url: string;
    file_name: string;
  }>`
    select id, blob_url, file_name
    from firm_portfolio_files
    where profile_id = ${firm.id}
    order by created_at desc
  `;

  const user = await getCurrentUser();
  const canRequest = user?.role === RoleValues.CUSTOMER;

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)] px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <Building2 className="h-4 w-4 text-amber-600" />
            Verified Firm
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            {firm.firm_name ?? firm.name}
          </h1>
          <p className="text-sm text-neutral-500">
            {firm.city} • {firm.pincode} • {firm.experience_years}+ years
          </p>
          <p className="text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-amber-600" />
              Verified
            </span>{" "}
            •{" "}
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              4.8/5
            </span>
          </p>
          {firm.owner_name && (
            <p className="text-sm text-neutral-500">Owner: {firm.owner_name}</p>
          )}
          <p className="text-sm text-neutral-600">{firm.about}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">Portfolio</h2>
          {portfolio.length === 0 ? (
            <p className="text-sm text-neutral-500">Portfolio uploads coming soon.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {portfolio.map((file) => (
                <a
                  key={file.id}
                  href={file.blob_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600 hover:border-neutral-400"
                >
                  {file.file_name}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">Past projects</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {["Modern 3BHK", "Villa refresh", "Compact studio"].map((label) => (
              <div
                key={label}
                className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600"
              >
                <div className="h-24 rounded-lg bg-gradient-to-br from-amber-100 via-white to-rose-100" />
                <p className="mt-3 font-semibold text-neutral-800">{label}</p>
                <p className="text-xs text-neutral-500">Bengaluru • Residential</p>
              </div>
            ))}
          </div>
        </div>

        {canRequest ? (
          <form action={requestProjectAction} className="space-y-4 rounded-2xl border border-neutral-200 p-6">
            <input type="hidden" name="firmId" value={firm.user_id} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Project title</label>
              <input
                name="title"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Project details</label>
              <textarea
                name="description"
                rows={4}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
                Request Project
              </button>
              <button className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700">
                Select Firm
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-neutral-500">
            Sign in as a customer to request a project with this firm.
          </p>
        )}
      </div>
    </div>
  );
}
