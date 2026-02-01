import { Zap } from "lucide-react";
import EstimatorForm from "@/components/estimator/EstimatorForm";
import FadeIn from "@/components/animations/FadeIn";

export default function EstimatorPage() {
  return (
    <div className="page bg-white min-w-0 overflow-visible">
      <div className="page-inner min-w-0 max-w-4xl">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">AI Cost Estimator</p>
          </div>
          <h1 className="heading-lg mb-3">Know your interior budget early</h1>
          <p className="text-[var(--text-muted)] max-w-2xl">
            Get an AI-powered cost range based on your property, location, and preferences. Complete the steps below for an instant estimate.
          </p>
        </FadeIn>
        <FadeIn delay={0.1} className="w-full overflow-visible">
          <EstimatorForm />
        </FadeIn>
      </div>
    </div>
  );
}
