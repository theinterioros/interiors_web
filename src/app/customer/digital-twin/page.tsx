import { uploadDigitalTwinFileAction } from "@/app/actions/digitalTwin";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DigitalTwinPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const files = await prisma.digitalTwinFile.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Digital Twin</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Home documentation vault</h1>
          <p className="text-sm text-neutral-500">
            Upload wiring, plumbing, floor plans, and handover files. Free for the first year.
          </p>
        </div>

        <form
          action={uploadDigitalTwinFileAction}
          encType="multipart/form-data"
          className="space-y-4 rounded-2xl border border-neutral-200 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Category</label>
              <select
                name="category"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="WIRING">Wiring diagrams</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="FLOOR_PLAN">Floor plans</option>
                <option value="HANDOVER">Final handover docs</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Upload file</label>
              <input
                type="file"
                name="file"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
            Upload document
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">Your documents</h2>
          {files.length === 0 ? (
            <p className="text-sm text-neutral-500">No documents uploaded yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {files.map((file) => (
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
      </div>
    </div>
  );
}
