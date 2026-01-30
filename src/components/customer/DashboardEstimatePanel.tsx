"use client";

import { useState } from "react";
import CitySelect from "@/components/ui/CitySelect";

type EstimateResult = {
  min: number;
  max: number;
  currency: string;
  breakdown: {
    ratePerSqFt: number;
    squareFeet: number;
    adjusted: number;
  };
  disclaimer: string;
};

export default function DashboardEstimatePanel() {
  const [result, setResult] = useState<EstimateResult | null>(null);
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
    const toSqft =
      unit === "SQM" ? area * 10.7639 : unit === "SQYD" ? area * 9 : area;
    const configuration = String(formData.get("configuration") ?? "2BHK");
    const rooms =
      configuration === "1BHK"
        ? 1
        : configuration === "2BHK"
          ? 2
          : configuration === "3BHK"
            ? 3
            : configuration === "4BHK"
              ? 4
              : 5;

    const payload = {
      city: formData.get("city"),
      pincode: formData.get("pincode"),
      squareFeet: Math.max(0, Math.round(toSqft)),
      propertyType: formData.get("propertyType"),
      rooms,
    };

    try {
      const response = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to estimate.");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to estimate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 mb-12">
      {/* Input Panel */}
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
              <label className="text-sm font-medium text-[var(--foreground)]">Pincode</label>
              <input name="pincode" required placeholder="e.g. 560001" className="input" />
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
            {loading ? "Estimating…" : "Get estimate"}
          </button>
        </form>
      </div>

      {/* Output Panel — only show breakup after estimate */}
      <div className="card-subtle">
        <p className="eyebrow mb-3">Output panel</p>
        <h2 className="heading-md mb-6">Estimated cost breakup</h2>
        {result ? (
          <>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-muted)]">Square feet</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">{result.breakdown.squareFeet}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--text-muted)]">Estimated range</span>
                <span className="text-sm font-semibold text-[var(--brand)]">
                  ₹{result.min.toLocaleString()} – ₹{result.max.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-subtle)]">
              Our AI analyses your property details and location to provide this estimated range. Final costs depend on scope and materials.
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Enter your property details in the input panel and click <strong>Get estimate</strong> to see your cost breakup.
          </p>
        )}
      </div>
    </div>
  );
}
