import EstimatorForm from "@/components/estimator/EstimatorForm";

export default function EstimatorPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">AI Cost Estimator</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Transparent cost estimates</h1>
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
