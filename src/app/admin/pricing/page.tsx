import { addRateAction, toggleRateAction } from "@/app/actions/admin";
import { MapPin } from "lucide-react";
import { getAdminSettings } from "@/lib/settings";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const settings = await getAdminSettings();

  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Pricing Configuration</p>
          </div>
          <h1 className="heading-lg mb-3">City & pincode rates</h1>
          <p className="text-[var(--text-muted)]">
            Maintain ₹ per sq ft pricing for the estimator.
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-8">
          <form action={addRateAction} className="card space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">City</label>
                <input name="city" required className="input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Pincode</label>
                <input name="pincode" required className="input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">₹/sqft</label>
                <input name="ratePerSqFt" type="number" min={1} required className="input" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Add rate
            </button>
          </form>
        </FadeIn>

        <FadeIn delay={0.3}>
          <h2 className="heading-md mb-6">Active rates</h2>
          {settings.rates.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No rates configured yet.</p>
          ) : (
            <StaggerChildren className="space-y-3">
              {settings.rates.map((rate) => (
                <FadeInItem key={rate.id}>
                  <div className="card flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {rate.city} • {rate.pincode}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">₹{rate.ratePerSqFt} per sq ft</p>
                    </div>
                    <form action={toggleRateAction}>
                      <input type="hidden" name="rateId" value={rate.id} />
                      <input type="hidden" name="isActive" value={rate.isActive ? "false" : "true"} />
                      <button type="submit" className="btn btn-secondary text-xs">
                        {rate.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </FadeInItem>
              ))}
            </StaggerChildren>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
