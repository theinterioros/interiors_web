import { Cuboid, FolderOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { RoleValues } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DigitalTwinPage() {
  await requireRole([RoleValues.CUSTOMER]);

  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
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
          <div className="card">
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

          <div className="card">
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
