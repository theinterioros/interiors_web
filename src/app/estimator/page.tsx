import { Sparkles } from "lucide-react";
import EstimatorForm from "@/components/estimator/EstimatorForm";
import FadeIn from "@/components/animations/FadeIn";

export default function EstimatorPage() {
  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">AI Cost Estimator</p>
          </div>
          <h1 className="heading-lg mb-3">Know your interior budget early</h1>
          <p className="text-[var(--text-muted)]">
            Admin-maintained ₹/sqft rates with a simple, deterministic model. AI enhancements coming soon.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <EstimatorForm />
        </FadeIn>
      </div>
    </div>
  );
}
