import { addRateAction, toggleRateAction } from "@/app/actions/admin";
import { MapPin } from "lucide-react";
import { getAdminSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const settings = await getAdminSettings();

  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <MapPin className="h-4 w-4 text-amber-600" />
            Pricing Configuration
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">City & pincode rates</h1>
          <p className="text-sm text-neutral-500">
            Maintain ₹ per sq ft pricing for the estimator.
          </p>
        </div>

        <form action={addRateAction} className="card space-y-4">
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
          <button className="rounded-md bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-amber-400 hover:to-amber-500">
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
            <div key={rate.id} className="card flex items-center justify-between">
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
