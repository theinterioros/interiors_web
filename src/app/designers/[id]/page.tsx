import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@/generated/prisma";
import { requestProjectAction } from "@/app/actions/project";

export default async function DesignerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const designer = await prisma.designerProfile.findUnique({
    where: { id: params.id },
    include: { portfolio: true },
  });

  if (!designer || designer.status !== "APPROVED") {
    return (
      <div className="min-h-screen bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl text-sm text-neutral-500">
          Designer not found or not approved yet.
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  const canRequest = user?.role === Role.CUSTOMER;

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Verified Designer</p>
          <h1 className="text-3xl font-semibold text-neutral-900">{designer.name}</h1>
          <p className="text-sm text-neutral-500">
            {designer.city} • {designer.pincode} • {designer.experienceYears}+ years
          </p>
          <p className="text-sm text-neutral-600">{designer.about}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">Portfolio</h2>
          {designer.portfolio.length === 0 ? (
            <p className="text-sm text-neutral-500">Portfolio uploads coming soon.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {designer.portfolio.map((file) => (
                <a
                  key={file.id}
                  href={file.blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600 hover:border-neutral-400"
                >
                  {file.fileName}
                </a>
              ))}
            </div>
          )}
        </div>

        {canRequest ? (
          <form action={requestProjectAction} className="space-y-4 rounded-2xl border border-neutral-200 p-6">
            <input type="hidden" name="designerId" value={designer.userId} />
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
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
              Request Project
            </button>
          </form>
        ) : (
          <p className="text-sm text-neutral-500">
            Sign in as a customer to request a project with this designer.
          </p>
        )}
      </div>
    </div>
  );
}
