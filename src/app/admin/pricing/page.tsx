import { addRateAction, toggleRateAction } from "@/app/actions/admin";
import { getAdminSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const settings = await getAdminSettings();

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Pricing Configuration</p>
          <h1 className="text-3xl font-semibold text-neutral-900">City & pincode rates</h1>
          <p className="text-sm text-neutral-500">
            Maintain ₹ per sq ft pricing for the estimator.
          </p>
        </div>

        <form action={addRateAction} className="space-y-4 rounded-2xl border border-neutral-200 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">City</label>
              <input
                name="city"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Pincode</label>
              <input
                name="pincode"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">₹/sqft</label>
              <input
                name="ratePerSqFt"
                type="number"
                min={1}
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
            Add rate
          </button>
        </form>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Active rates</h2>
          {settings.rates.length === 0 ? (
            <p className="text-sm text-neutral-500">No rates configured yet.</p>
          ) : (
            <div className="space-y-3">
              {settings.rates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {rate.city} • {rate.pincode}
                    </p>
                    <p className="text-xs text-neutral-500">₹{rate.ratePerSqFt} per sq ft</p>
                  </div>
                  <form action={toggleRateAction}>
                    <input type="hidden" name="rateId" value={rate.id} />
                    <input type="hidden" name="isActive" value={rate.isActive ? "false" : "true"} />
                    <button className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-700">
                      {rate.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
