import Link from "next/link";
import { Camera, Cuboid, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { RoleValues } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VisualizationPage() {
  await requireRole([RoleValues.CUSTOMER]);

  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-500">
              <Cuboid className="h-4 w-4 text-amber-600" />
              AR / 3D Visualization
            </div>
            <h1 className="text-3xl font-semibold text-neutral-900">Bring your space to life</h1>
            <p className="text-sm text-neutral-600">
              Unlock the 3D preview after a one-time ₹999 payment. AR features are coming soon.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            AR • Coming Soon
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="card">
            <h2 className="text-lg font-semibold text-neutral-900">Unlock visualization</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Pay ₹999 to activate room visualization and save your design previews.
            </p>
            <button className="mt-4 w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500">
              Pay ₹999 & Unlock
            </button>

            <div className="mt-6 space-y-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
                <Camera className="h-3.5 w-3.5 text-amber-600" />
                Upload room photos
              </p>
              <input
                type="file"
                multiple
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
              <p className="text-xs text-neutral-500">Or pick a sample layout below.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Living Room", "Master Bedroom", "Kitchen", "Kids Room"].map((label) => (
                  <button
                    key={label}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-4 text-sm text-neutral-700 hover:border-neutral-300"
                  >
                    {label} sample
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-neutral-900">3D viewer</h2>
            <div className="mt-4 flex h-64 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white/80 text-sm text-neutral-500">
              3D preview surface (rotate / zoom)
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700">
                Save design
              </button>
              <Link
                href="/designers"
                className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Request Firms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
