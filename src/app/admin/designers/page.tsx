import { approveDesignerAction, rejectDesignerAction } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminDesignersPage() {
  const pending = await prisma.designerProfile.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Designer Approvals</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Review applications</h1>
          <p className="text-sm text-neutral-500">Approve designers to show publicly.</p>
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-neutral-500">No pending approvals.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((profile) => (
              <div key={profile.id} className="rounded-2xl border border-neutral-200 p-6">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-neutral-900">{profile.name}</p>
                  <p className="text-sm text-neutral-500">
                    {profile.city} • {profile.pincode} • {profile.experienceYears}+ years
                  </p>
                  <p className="text-sm text-neutral-600">{profile.about}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <form action={approveDesignerAction}>
                    <input type="hidden" name="profileId" value={profile.id} />
                    <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
                      Approve
                    </button>
                  </form>
                  <form action={rejectDesignerAction}>
                    <input type="hidden" name="profileId" value={profile.id} />
                    <button className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
