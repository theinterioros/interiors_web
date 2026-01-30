import { Cuboid, FolderOpen } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function DigitalTwinPage() {
  await requireCustomerPaid();

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Cuboid className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Digital Twin</p>
          </div>
          <h1 className="heading-lg mb-3">Final 3D model & documents</h1>
          <p className="text-[var(--text-muted)]">
            Access room-wise views, drawings, and warranties post-handover.
          </p>
        </FadeIn>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <FadeIn delay={0.2}>
            <div className="card">
              <h2 className="heading-md mb-4">3D model viewer</h2>
              <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] text-sm text-[var(--text-muted)] mb-4">
                Room-wise 3D view placeholder
              </div>
              <div className="flex flex-wrap gap-3">
                {["Living", "Kitchen", "Master", "Kids", "Bathrooms"].map((room) => (
                  <button key={room} className="btn btn-secondary text-xs">
                    {room}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="h-5 w-5 text-[var(--brand)]" />
                <h2 className="heading-md">Documents vault</h2>
              </div>
              <StaggerChildren className="space-y-3">
                {[
                  "Floor plans",
                  "3D drawings",
                  "Electrical layouts",
                  "Plumbing layouts",
                  "Invoices & quotations",
                  "Warranty cards",
                ].map((label) => (
                  <FadeInItem key={label}>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <span className="text-sm text-[var(--text-muted)]">{label}</span>
                      <button className="text-xs font-semibold text-[var(--brand)] hover:underline">
                        Download
                      </button>
                    </div>
                  </FadeInItem>
                ))}
              </StaggerChildren>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
