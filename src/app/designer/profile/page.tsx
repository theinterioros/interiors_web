import { updateDesignerProfileAction, uploadPortfolioAction } from "@/app/actions/designer";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DesignerProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.designerProfile.findUnique({
    where: { userId: user.id },
    include: { portfolio: true },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Designer Profile</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Manage your profile</h1>
          <p className="text-sm text-neutral-500">
            Update your details and upload portfolio documents for review.
          </p>
        </div>

        <form
          action={updateDesignerProfileAction}
          className="space-y-4 rounded-2xl border border-neutral-200 p-6"
        >
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
                defaultValue={profile?.experienceYears ?? 0}
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
            <label className="text-sm font-medium text-neutral-700">About</label>
            <textarea
              name="about"
              rows={4}
              defaultValue={profile?.about ?? ""}
              required
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
            Save profile
          </button>
        </form>

        <form
          action={uploadPortfolioAction}
          encType="multipart/form-data"
          className="space-y-4 rounded-2xl border border-neutral-200 p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-900">Portfolio uploads</h2>
          <input type="file" name="file" required className="text-sm" />
          <button className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800">
            Upload portfolio file
          </button>
          <div className="space-y-2 text-sm text-neutral-600">
            {profile?.portfolio.map((file) => (
              <a key={file.id} href={file.blobUrl} target="_blank" rel="noreferrer" className="block underline">
                {file.fileName}
              </a>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
