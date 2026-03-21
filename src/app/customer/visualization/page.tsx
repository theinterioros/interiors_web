import { Cuboid, Sparkles } from "lucide-react";
import { requireCustomerPaid } from "@/lib/auth";
import FadeIn from "@/components/animations/FadeIn";
import VisualizationStudio from "@/components/customer/VisualizationStudio";

export const dynamic = "force-dynamic";

export default async function VisualizationPage() {
  await requireCustomerPaid();

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cuboid className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">AI Visualization</p>
          </div>
          <h1 className="heading-lg mb-2">Visualize your interiors with AI</h1>
          <p className="text-sm text-[var(--text-muted)] max-w-3xl">
            Upload a floorplan or your room image, choose an interior style, and generate dynamic room-wise design concepts.
          </p>
        </div>
        <span className="badge">
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          Live Beta
        </span>
      </FadeIn>

      <VisualizationStudio />
    </div>
  );
}
