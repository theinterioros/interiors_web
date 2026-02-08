import { Zap } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import EstimatorForm from "@/components/estimator/EstimatorForm";
import FadeIn from "@/components/animations/FadeIn";

export const dynamic = "force-dynamic";

export default async function EstimatorPage() {
  const user = await getCurrentUser();
  const isLoggedInCustomer = user?.role === "CUSTOMER";

  return (
    <div className="page bg-white min-w-0 overflow-visible">
      <div className="page-inner min-w-0 max-w-4xl">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">AI Cost Estimator</p>
          </div>
          <h1 className="heading-lg mb-3">Know Your Interior Budget Early</h1>
          <p className="text-[var(--text-muted)] max-w-2xl">
            Get an AI-powered cost range. Share your property details and contact to see your estimate. Create a free account for a detailed breakdown and to connect with verified designers.
          </p>
        </FadeIn>
        <FadeIn delay={0.1} className="w-full overflow-visible">
          <EstimatorForm isLoggedInCustomer={isLoggedInCustomer} />
        </FadeIn>
      </div>
    </div>
  );
}
