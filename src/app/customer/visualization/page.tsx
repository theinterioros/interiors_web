import Link from "next/link";
import { Camera, Cuboid, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { RoleValues } from "@/lib/types";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function VisualizationPage() {
  await requireRole([RoleValues.CUSTOMER]);

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cuboid className="h-4 w-4 text-[var(--brand)]" />
              <p className="eyebrow">AR / 3D Visualization</p>
            </div>
            <h1 className="heading-lg mb-3">Bring your space to life</h1>
            <p className="text-[var(--text-muted)]">
              Unlock the 3D preview after a one-time ₹999 payment. AR features are coming soon.
            </p>
          </div>
          <span className="badge">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            AR • Coming Soon
          </span>
        </FadeIn>

        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.2}>
            <div className="card">
              <h2 className="heading-md mb-3">Unlock visualization</h2>
              <p className="text-[var(--text-muted)] mb-6">
                Pay ₹999 to activate room visualization and save your design previews.
              </p>
              <button className="btn btn-primary w-full mb-6">
                Pay ₹999 & Unlock
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-3.5 w-3.5 text-[var(--brand)]" />
                  <p className="eyebrow">Upload room photos</p>
                </div>
                <input type="file" multiple className="input" />
                <p className="text-xs text-[var(--text-muted)]">Or pick a sample layout below.</p>
                <StaggerChildren className="grid gap-3 sm:grid-cols-2">
                  {["Living Room", "Master Bedroom", "Kitchen", "Kids Room"].map((label) => (
                    <FadeInItem key={label}>
                      <button className="btn btn-secondary w-full text-xs">
                        {label} sample
                      </button>
                    </FadeInItem>
                  ))}
                </StaggerChildren>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="card">
              <h2 className="heading-md mb-4">3D viewer</h2>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] text-sm text-[var(--text-muted)] mb-4">
                3D preview surface (rotate / zoom)
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-secondary text-xs">Save design</button>
                <Link href="/designers" className="btn btn-primary text-xs">
                  Request Firms
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
