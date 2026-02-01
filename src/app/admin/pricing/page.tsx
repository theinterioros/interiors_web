import { addRateAction, setDefaultRateAction, toggleRateAction } from "@/app/actions/admin";
import { MapPin } from "lucide-react";
import { getAdminSettings } from "@/lib/settings";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";
import CitySelect from "@/components/ui/CitySelect";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const settings = await getAdminSettings();

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Configuration</p>
        </div>
        <h1 className="heading-lg mb-3">AI Estimator pricing</h1>
        <p className="text-[var(--text-muted)]">
          Set default rates per sq ft, sq yd, or sq m for all locations. Add city & pincode overrides with optional sq yd/sq m rates.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="card p-6">
          <h2 className="heading-md mb-4">Default rates (all cities & pincodes)</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Used when no city-specific rate is set. ₹/sq ft is required; sq yd and sq m are optional (estimator will derive them from sq ft if not set).
          </p>
          <form action={setDefaultRateAction} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2 min-w-[120px]">
              <label className="text-sm font-medium text-[var(--foreground)]">₹/sq ft</label>
              <input
                name="ratePerSqFt"
                type="number"
                min={1}
                required
                defaultValue={settings.defaultRate ?? ""}
                placeholder="e.g. 85"
                className="input"
              />
            </div>
            <div className="space-y-2 min-w-[120px]">
              <label className="text-sm font-medium text-[var(--foreground)]">₹/sq yd (optional)</label>
              <input
                name="ratePerSqYd"
                type="number"
                min={0}
                defaultValue={settings.defaultRatePerSqYd ?? ""}
                placeholder="e.g. 765"
                className="input"
              />
            </div>
            <div className="space-y-2 min-w-[120px]">
              <label className="text-sm font-medium text-[var(--foreground)]">₹/sq m (optional)</label>
              <input
                name="ratePerSqM"
                type="number"
                min={0}
                defaultValue={settings.defaultRatePerSqM ?? ""}
                placeholder="e.g. 915"
                className="input"
              />
            </div>
            <button type="submit" className="btn btn-primary">Save default rates</button>
          </form>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="card p-6">
          <h2 className="heading-md mb-4">Pincode-specific rates</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Override the default for specific city + pincode. ₹/sq ft required; sq yd and sq m optional.
          </p>
          <form action={addRateAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] sm:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">City</label>
              <CitySelect name="city" required placeholder="Search and select city" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Pincode</label>
              <input name="pincode" required className="input" placeholder="e.g. 560001" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">₹/sq ft</label>
              <input name="ratePerSqFt" type="number" min={1} required className="input" placeholder="e.g. 90" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">₹/sq yd (opt)</label>
              <input name="ratePerSqYd" type="number" min={0} className="input" placeholder="—" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">₹/sq m (opt)</label>
              <input name="ratePerSqM" type="number" min={0} className="input" placeholder="—" />
            </div>
            <button type="submit" className="btn btn-primary">Add rate</button>
          </form>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <h2 className="heading-md mb-4">Active overrides</h2>
        {settings.rates.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No pincode-specific rates yet. The default rate applies everywhere.</p>
        ) : (
          <StaggerChildren className="space-y-3">
            {settings.rates.map((rate) => (
              <FadeInItem key={rate.id}>
                <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {rate.city} • {rate.pincode}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      ₹{rate.ratePerSqFt}/sq ft
                      {rate.ratePerSqYd != null && ` · ₹${rate.ratePerSqYd}/sq yd`}
                      {rate.ratePerSqM != null && ` · ₹${rate.ratePerSqM}/sq m`}
                    </p>
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
  );
}
