"use client";

import { useState } from "react";
import CitySelect from "@/components/ui/CitySelect";
import EstimatorResultSummary from "@/components/estimator/EstimatorResultSummary";
import Link from "next/link";
import { ESTIMATOR_AREA_OPTIONS } from "@/lib/estimator-types";
import type { EstimatorApiData } from "@/lib/estimator-types";
import ValidatedPincodeInput from "@/components/ui/ValidatedPincodeInput";

export default function CustomerEstimatorClient() {
  const [result, setResult] = useState<EstimatorApiData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const area = Number(formData.get("carpetArea"));
    const areaUnit = String(formData.get("areaUnit") ?? "sqft").toLowerCase();
    const normalizedUnit = areaUnit === "sqyd" ? "sqyd" : areaUnit === "sqm" ? "sqm" : "sqft";
    const configuration = String(formData.get("configuration") ?? "2BHK");
    const areas = formData.getAll("areas").map((v) => String(v));

    const payload = {
      city: formData.get("city"),
      pincode: formData.get("pincode") ?? "",
      area: Math.max(0, area),
      areaUnit: normalizedUnit,
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
      const res = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as EstimatorApiData & { error?: string };
      if (!res.ok) throw new Error(data.error || "Unable to estimate.");
      setResult(data as EstimatorApiData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to estimate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="card">
        <h2 className="heading-md mb-4">Input Parameters</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">City</label>
              <CitySelect name="city" required placeholder="Select city" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Pincode
              </label>
              <ValidatedPincodeInput
                name="pincode"
                placeholder="e.g. 560001"
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Property Type</label>
              <select name="propertyType" className="input w-full">
                <option value="apartment">Apartment / Flat</option>
                <option value="villa">Villa / Independent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Configuration</label>
              <select name="configuration" className="input w-full">
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK">4 BHK</option>
                <option value="5BHK">5+ BHK</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Interior type</label>
              <select name="interiorTier" className="input w-full" defaultValue="standard">
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Material</label>
              <select name="material" className="input w-full" defaultValue="laminate">
                <option value="laminate">Laminate</option>
                <option value="acrylic">Acrylic</option>
                <option value="pu_finish">PU finish</option>
                <option value="veneer">Veneer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Possession</label>
              <select name="possession" className="input w-full" defaultValue="ready">
                <option value="ready">Ready</option>
                <option value="under_construction">Under construction</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Carpet Area</label>
              <input
                name="carpetArea"
                type="number"
                min={100}
                required
                placeholder="e.g. 1200"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Area Unit</label>
              <select name="areaUnit" className="input w-full">
                <option value="sqft">Sq.ft</option>
                <option value="sqyd">Sq.yd</option>
                <option value="sqm">Sq.m</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Areas</label>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] p-3">
                {ESTIMATOR_AREA_OPTIONS.map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="areas" value={opt.key} defaultChecked className="rounded" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Budget (optional)
              </label>
              <input name="budgetNote" className="input w-full" placeholder="e.g. ~15 lakhs" maxLength={500} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
            {loading ? "Calculating…" : "Get detailed estimate"}
          </button>
        </form>
      </div>

      <div className="card border-[var(--border)] bg-[var(--surface-subtle)]/30">
        <h2 className="heading-md mb-4">Output</h2>
        {result ? (
          <div className="space-y-6">
            <EstimatorResultSummary result={result} showSource />
            <Link href="/designers" className="btn btn-primary inline-flex">
              Browse designers
            </Link>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Enter your property details in the input panel and click <strong>Get detailed estimate</strong> to see the
            breakdown here.
          </p>
        )}
      </div>
    </div>
  );
}
