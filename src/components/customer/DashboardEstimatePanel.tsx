"use client";

import { useState } from "react";
import CitySelect from "@/components/ui/CitySelect";
import EstimatorResultSummary from "@/components/estimator/EstimatorResultSummary";
import { ESTIMATOR_AREA_OPTIONS } from "@/lib/estimator-types";
import type { EstimatorApiData } from "@/lib/estimator-types";
import ValidatedPincodeInput from "@/components/ui/ValidatedPincodeInput";

export default function DashboardEstimatePanel() {
  const [result, setResult] = useState<EstimatorApiData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const area = Number(formData.get("carpetArea"));
    const unit = String(formData.get("areaUnit") ?? "SFT");
    const toSqft = unit === "SQM" ? area * 10.7639 : unit === "SQYD" ? area * 9 : area;
    const configuration = String(formData.get("configuration") ?? "2BHK");
    const areas = formData.getAll("areas").map((v) => String(v));

    const payload = {
      city: formData.get("city"),
      pincode: formData.get("pincode") ?? "",
      squareFeet: Math.max(0, Math.round(toSqft)),
      propertyType: formData.get("propertyType") === "villa" ? "villa" : "apartment",
      bhk: configuration,
      interiorTier: String(formData.get("interiorTier") ?? "standard"),
      material: String(formData.get("material") ?? "laminate"),
      possession: String(formData.get("possession") ?? "ready"),
      areas,
      requireContact: false,
      ...(String(formData.get("budgetNote") ?? "").trim()
        ? { budgetNote: String(formData.get("budgetNote")).trim() }
        : {}),
    };

    try {
      const response = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as EstimatorApiData & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Unable to estimate.");
      }
      setResult(data as EstimatorApiData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to estimate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 mb-12">
      <div className="card">
        <p className="eyebrow mb-3">Input panel</p>
        <h2 className="heading-md mb-6">Property details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">City</label>
              <CitySelect name="city" required placeholder="Search and select city" className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Pincode
              </label>
              <ValidatedPincodeInput
                name="pincode"
                placeholder="e.g. 560001"
                className="input"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Property type</label>
              <select name="propertyType" className="input">
                <option value="apartment">Residential</option>
                <option value="villa">Villa / Independent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Configuration</label>
              <select name="configuration" className="input">
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK">4 BHK</option>
                <option value="5BHK">5+ BHK</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Interior type</label>
              <select name="interiorTier" className="input" defaultValue="standard">
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Material</label>
              <select name="material" className="input" defaultValue="laminate">
                <option value="laminate">Laminate</option>
                <option value="acrylic">Acrylic</option>
                <option value="pu_finish">PU finish</option>
                <option value="veneer">Veneer</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Possession</label>
              <select name="possession" className="input max-w-xs" defaultValue="ready">
                <option value="ready">Ready</option>
                <option value="under_construction">Under construction</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Areas</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-lg border border-[var(--border)] p-3">
              {ESTIMATOR_AREA_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="areas" value={opt.key} defaultChecked className="rounded" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Carpet area</label>
            <div className="flex gap-2 items-stretch">
              <div className="flex-1 min-w-0">
                <input
                  name="carpetArea"
                  type="number"
                  min={100}
                  required
                  placeholder="e.g. 1200"
                  className="input w-full min-w-0"
                />
              </div>
              <div className="w-[7.5rem] shrink-0">
                <select
                  name="areaUnit"
                  className="input h-full w-full min-w-0 bg-[var(--surface-subtle)] font-medium"
                  aria-label="Area unit"
                >
                  <option value="SFT">Sq.ft</option>
                  <option value="SQM">Sq.m</option>
                  <option value="SQYD">Sq.yd</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Budget (optional)</label>
            <input name="budgetNote" className="input w-full" placeholder="e.g. ~15 lakhs" maxLength={500} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
            {loading ? "Estimating…" : "Get estimate"}
          </button>
        </form>
      </div>

      <div className="card-subtle">
        <p className="eyebrow mb-3">Output panel</p>
        <h2 className="heading-md mb-6">Estimated cost breakup</h2>
        {result ? (
          <>
            <EstimatorResultSummary result={result} showSource />
            <p className="text-xs text-[var(--text-subtle)] mt-4">
              Our AI analyses your property details and scope to provide this estimate. Final costs depend on site
              conditions and materials.
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Enter your property details in the input panel and click <strong>Get estimate</strong> to see your cost
            breakup.
          </p>
        )}
      </div>
    </div>
  );
}
