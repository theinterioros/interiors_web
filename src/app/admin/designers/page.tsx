import { approveFirmAction, rejectFirmAction } from "@/app/actions/admin";
import { BadgeCheck } from "lucide-react";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDesignersPage() {
  const pending = await sql<{
    id: string;
    name: string;
    city: string;
    pincode: string;
    experience_years: number;
    about: string;
  }>`
    select id, name, city, pincode, experience_years, about
    from firm_profiles
    where status = 'PENDING'
    order by created_at desc
  `;

  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <BadgeCheck className="h-4 w-4 text-amber-600" />
            Firm Approvals
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Review applications</h1>
          <p className="text-sm text-neutral-500">Approve firms to show publicly.</p>
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-neutral-500">No pending approvals.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((profile) => (
              <div key={profile.id} className="card">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-neutral-900">{profile.name}</p>
                  <p className="text-sm text-neutral-500">
                    {profile.city} • {profile.pincode} • {profile.experience_years}+ years
                  </p>
                  <p className="text-sm text-neutral-600">{profile.about}</p>
                </div>
                <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-600">
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                    Document checklist
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <span>GST certificate</span>
                    <span>Company registration / MSME</span>
                    <span>PAN</span>
                    <span>Bank details</span>
                    <span>Portfolio quality</span>
                    <span>City coverage</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <form action={approveFirmAction}>
                    <input type="hidden" name="profileId" value={profile.id} />
                    <button className="rounded-md bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-amber-400 hover:to-amber-500">
                      Approve
                    </button>
                  </form>
                  <form action={rejectFirmAction}>
                    <input type="hidden" name="profileId" value={profile.id} />
                    <button className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800">
                      Reject
                    </button>
                  </form>
                  <button className="rounded-md border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700">
                    Request info
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
