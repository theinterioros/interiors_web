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
        <div className="space-y-4">
          <p className="eyebrow">Property essentials</p>
          <div className="grid gap-4 md:grid-cols-3">
            <input name="city" required placeholder="City" className="input" />
            <input name="pincode" required placeholder="Pincode" className="input" />
            <select name="propertyType" className="input">
              <option value="apartment">Residential</option>
              <option value="villa">Villa / Independent</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <select name="configuration" className="input">
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
                className="input"
              />
              <select name="areaUnit" className="input">
                <option value="SFT">SFT</option>
                <option value="SQM">SQ.M</option>
                <option value="SQYD">SQ.YD</option>
              </select>
            </div>
            <div className="card-subtle text-xs text-[var(--text-muted)]">
              We use these details to calculate your estimate.
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Estimate uses city, property type, configuration, and carpet area. You can refine later.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
          {loading ? "Estimating..." : "Estimate Cost"}
        </button>
      </form>

      <div className="card">
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
                  <span>Rate per sq ft:</span>
                  <span className="font-semibold text-[var(--foreground)]">₹{result.breakdown.ratePerSqFt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Square feet:</span>
                  <span className="font-semibold text-[var(--foreground)]">{result.breakdown.squareFeet}</span>
                </div>
                <div className="flex justify-between">
                  <span>Property modifier:</span>
                  <span className="font-semibold text-[var(--foreground)]">{result.breakdown.propertyMultiplier}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Room modifier:</span>
                  <span className="font-semibold text-[var(--foreground)]">{result.breakdown.roomModifier}x</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                  <span>Adjusted estimate:</span>
                  <span className="font-semibold text-[var(--brand)]">₹{result.breakdown.adjusted.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{result.disclaimer}</p>
            <button className="btn btn-primary w-full">
              Email my estimate
            </button>
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
