import { Sparkles } from "lucide-react";
import EstimatorForm from "@/components/estimator/EstimatorForm";

export default function EstimatorPage() {
  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-500">
            <Sparkles className="h-4 w-4 text-amber-600" />
            AI Cost Estimator
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Know your interior budget early</h1>
          <p className="text-sm text-neutral-500">
            Admin-maintained ₹/sqft rates with a simple, deterministic model. AI enhancements coming
            soon.
          </p>
        </div>
        <EstimatorForm />
      </div>
    </div>
  );
}
