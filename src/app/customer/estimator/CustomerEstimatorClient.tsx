"use client";

import { useState } from "react";
import CitySelect from "@/components/ui/CitySelect";
import Link from "next/link";

type Breakdown = {
  ratePerSqFt: number;
  squareFeet: number;
  propertyMultiplier?: number;
  roomModifier?: number;
  adjusted?: number;
};

type Result = {
  min: number;
  max: number;
  currency: string;
  breakdown: Breakdown;
  disclaimer: string;
};

export default function CustomerEstimatorClient() {
  const [result, setResult] = useState<Result | null>(null);
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
    const rooms =
      configuration === "1BHK" ? 1 : configuration === "2BHK" ? 2 : configuration === "3BHK" ? 3 : configuration === "4BHK" ? 4 : 5;

    const payload = {
      city: formData.get("city"),
      pincode: formData.get("pincode"),
      area: Math.max(0, area),
      areaUnit: normalizedUnit,
      propertyType: formData.get("propertyType") === "villa" ? "villa" : "apartment",
      rooms,
      requireContact: false,
    };

    try {
      const res = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to estimate.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to estimate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="card">
        <h2 className="heading-md mb-4">Input parameters</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">City</label>
              <CitySelect name="city" required placeholder="Select city" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Pincode</label>
              <input name="pincode" required placeholder="e.g. 560001" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Property type</label>
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
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Carpet area</label>
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
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Area unit</label>
              <select name="areaUnit" className="input w-full">
                <option value="sqft">Sq.ft</option>
                <option value="sqyd">Sq.yd</option>
                <option value="sqm">Sq.m</option>
              </select>
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
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Estimated range</p>
              <p className="text-2xl font-bold text-[var(--brand)]">
                ₹{result.min.toLocaleString()} – ₹{result.max.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{result.currency}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
              <div className="flex justify-between items-center py-3 px-4">
                <span className="text-sm text-[var(--text-muted)]">Carpet area</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{result.breakdown.squareFeet} sq.ft</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4">
                <span className="text-sm text-[var(--text-muted)]">Rate (₹/sq.ft)</span>
                <span className="text-sm font-medium text-[var(--foreground)]">₹{result.breakdown.ratePerSqFt.toLocaleString()}</span>
              </div>
              {result.breakdown.propertyMultiplier != null && result.breakdown.propertyMultiplier !== 1 && (
                <div className="flex justify-between items-center py-3 px-4">
                  <span className="text-sm text-[var(--text-muted)]">Property multiplier</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">×{result.breakdown.propertyMultiplier}</span>
                </div>
              )}
              {result.breakdown.roomModifier != null && result.breakdown.roomModifier !== 1 && (
                <div className="flex justify-between items-center py-3 px-4">
                  <span className="text-sm text-[var(--text-muted)]">Room modifier</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">×{result.breakdown.roomModifier}</span>
                </div>
              )}
              {result.breakdown.adjusted != null && (
                <div className="flex justify-between items-center py-3 px-4">
                  <span className="text-sm text-[var(--text-muted)]">Adjusted base</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">₹{result.breakdown.adjusted.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 px-4">
                <span className="text-sm text-[var(--text-muted)]">Range (90% – 110%)</span>
                <span className="text-sm font-semibold text-[var(--brand)]">
                  ₹{result.min.toLocaleString()} – ₹{result.max.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-subtle)]">{result.disclaimer}</p>
            <Link href="/designers" className="btn btn-primary inline-flex">
              Browse designers
            </Link>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Enter your property details in the input panel and click <strong>Get detailed estimate</strong> to see the breakdown here.
          </p>
        )}
      </div>
    </div>
  );
}
