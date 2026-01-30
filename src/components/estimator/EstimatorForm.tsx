"use client";

import { useState } from "react";

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
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Property essentials</p>
          <div className="grid gap-4 md:grid-cols-3">
            <input
              name="city"
              required
              placeholder="City"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              name="pincode"
              required
              placeholder="Pincode"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
            <select
              name="propertyType"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="apartment">Residential</option>
              <option value="villa">Villa / Independent</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <select
              name="configuration"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="5BHK">5+ BHK</option>
            </select>
            <div className="flex gap-2">
              <input
                name="carpetArea"
                type="number"
                min={100}
                required
                placeholder="Carpet area"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
              <select
                name="areaUnit"
                className="rounded-md border border-neutral-200 px-2 py-2 text-sm"
              >
                <option value="SFT">SFT</option>
                <option value="SQM">SQ.M</option>
                <option value="SQYD">SQ.YD</option>
              </select>
            </div>
            <div className="rounded-md border border-dashed border-neutral-200 px-3 py-2 text-xs text-neutral-500">
              We use these details to calculate your estimate.
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          Estimate uses city, property type, configuration, and carpet area. You can refine later.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
        >
          {loading ? "Estimating..." : "Estimate Cost"}
        </button>
      </form>

      <div className="card">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Estimated range</p>
        {result ? (
          <div className="mt-4 space-y-3 text-sm text-neutral-600">
            <p className="text-3xl font-semibold text-neutral-900">
              ₹{result.min.toLocaleString()} - ₹{result.max.toLocaleString()}
            </p>
            <div className="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Breakdown</p>
              <div className="mt-3 space-y-1 text-sm">
                <p>Rate per sq ft: ₹{result.breakdown.ratePerSqFt}</p>
                <p>Square feet: {result.breakdown.squareFeet}</p>
                <p>Property modifier: {result.breakdown.propertyMultiplier}x</p>
                <p>Room modifier: {result.breakdown.roomModifier}x</p>
                <p>Adjusted estimate: ₹{result.breakdown.adjusted.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">{result.disclaimer}</p>
            <button className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500">
              Email my estimate
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Enter your details to receive a transparent estimate.
          </p>
        )}
      </div>
    </div>
  );
}
