import { Cuboid, FolderOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { RoleValues } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DigitalTwinPage() {
  await requireRole([RoleValues.CUSTOMER]);

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)] px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-500">
            <Cuboid className="h-4 w-4 text-amber-600" />
            Digital Twin
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Final 3D model & documents</h1>
          <p className="text-sm text-neutral-600">
            Access room-wise views, drawings, and warranties post-handover.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">3D model viewer</h2>
            <div className="mt-4 flex h-72 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white/80 text-sm text-neutral-500">
              Room-wise 3D view placeholder
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {["Living", "Kitchen", "Master", "Kids", "Bathrooms"].map((room) => (
                <button
                  key={room}
                  className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700"
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <FolderOpen className="h-5 w-5 text-amber-600" />
              Documents vault
            </div>
            <div className="mt-4 space-y-3 text-sm text-neutral-600">
              {[
                "Floor plans",
                "3D drawings",
                "Electrical layouts",
                "Plumbing layouts",
                "Invoices & quotations",
                "Warranty cards",
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
                >
                  <span>{label}</span>
                  <button className="text-xs font-semibold text-emerald-600">Download</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { uploadDigitalTwinFileAction } from "@/app/actions/digitalTwin";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DigitalTwinPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const files = await sql<{
    id: string;
    blob_url: string;
    file_name: string;
  }>`
    select id, blob_url, file_name
    from digital_twin_files
    where customer_id = ${user.id}
    order by created_at desc
  `;

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
      </div>
    </div>
  );
}
