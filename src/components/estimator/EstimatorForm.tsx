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
    const payload = {
      city: formData.get("city"),
      pincode: formData.get("pincode"),
      squareFeet: Number(formData.get("squareFeet")),
      propertyType: formData.get("propertyType"),
      rooms: Number(formData.get("rooms")),
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
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 p-6">
        <div className="grid gap-4 md:grid-cols-2">
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
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Total square feet</label>
            <input
              name="squareFeet"
              type="number"
              min={100}
              required
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Property type</label>
            <select
              name="propertyType"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Number of rooms</label>
          <input
            name="rooms"
            type="number"
            min={1}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Estimating..." : "Estimate Cost"}
        </button>
      </form>

      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Estimated range</p>
        {result ? (
          <div className="mt-4 space-y-3 text-sm text-neutral-600">
            <p className="text-3xl font-semibold text-neutral-900">
              ₹{result.min.toLocaleString()} - ₹{result.max.toLocaleString()}
            </p>
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Breakdown</p>
              <div className="mt-3 space-y-1 text-sm">
                <p>Rate per sq ft: ₹{result.breakdown.ratePerSqFt}</p>
                <p>Square feet: {result.breakdown.squareFeet}</p>
                <p>Property modifier: {result.breakdown.propertyMultiplier}x</p>
                <p>Room modifier: {result.breakdown.roomModifier}x</p>
                <p>Adjusted estimate: ₹{result.breakdown.adjusted.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">{result.disclaimer}</p>
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
