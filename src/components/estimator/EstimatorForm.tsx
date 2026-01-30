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
    propertyMultiplier: number;
    roomModifier: number;
    adjusted: number;
  };
  disclaimer: string;
};

export default function EstimatorForm() {
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
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 lg:items-start">
      <form onSubmit={handleSubmit} className="card space-y-5 flex-1 w-full min-w-0 max-w-xl">
        <p className="eyebrow">Property essentials</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="estimator-city" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">City</label>
            <CitySelect id="estimator-city" name="city" required placeholder="Search and select city" className="input" />
          </div>
          <div>
            <label htmlFor="estimator-pincode" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Pincode</label>
            <input id="estimator-pincode" name="pincode" required placeholder="e.g. 560001" className="input" />
          </div>
          <div>
            <label htmlFor="estimator-propertyType" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Property type</label>
            <select id="estimator-propertyType" name="propertyType" className="input">
              <option value="apartment">Residential</option>
              <option value="villa">Villa / Independent</option>
            </select>
          </div>
          <div>
            <label htmlFor="estimator-configuration" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Configuration</label>
            <select id="estimator-configuration" name="configuration" className="input">
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="5BHK">5+ BHK</option>
            </select>
          </div>
          <div>
            <label htmlFor="estimator-carpetArea" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Carpet area
            </label>
            <div className="flex gap-2 items-stretch">
              <div className="flex-1 min-w-0">
                <input
                  id="estimator-carpetArea"
                  name="carpetArea"
                  type="number"
                  min={100}
                  required
                  placeholder="e.g. 1200"
                  className="input w-full min-w-0"
                />
              </div>
              <div className="w-[6rem] shrink-0">
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
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          We use city, property type, configuration, and carpet area for the estimate.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
          {loading ? "Estimating..." : "Estimate Cost"}
        </button>
      </form>

      <div className="card w-full min-w-0 lg:max-w-sm lg:shrink-0">
        <p className="eyebrow mb-4">Estimated range</p>
        {result ? (
          <div className="space-y-4">
            <p className="text-3xl font-semibold text-[var(--foreground)]">
              ₹{result.min.toLocaleString()} - ₹{result.max.toLocaleString()}
            </p>
            <div className="card-subtle">
              <p className="eyebrow mb-3">Breakdown</p>
              <div className="space-y-2 text-sm text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Square feet:</span>
                  <span className="font-semibold text-[var(--foreground)]">{result.breakdown.squareFeet}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                  <span>Estimated range:</span>
                  <span className="font-semibold text-[var(--brand)]">₹{result.min.toLocaleString()} – ₹{result.max.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Our AI analyses your property details and location to provide this estimated range. Final costs depend on scope and materials.
            </p>
            <a href="/login?redirect=/estimator" className="btn btn-secondary w-full text-center">
              Sign in to get a detailed estimate
            </a>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Enter your details to receive a transparent estimate.
          </p>
        )}
      </div>
    </div>
  );
}
