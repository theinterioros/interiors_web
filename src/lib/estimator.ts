import { sql } from "@/lib/db";

type EstimateInput = {
  city: string;
  pincode: string;
  squareFeet: number;
  propertyType: "apartment" | "villa";
  rooms: number;
};

export async function estimateCost(input: EstimateInput) {
  const { city, pincode, squareFeet, propertyType, rooms } = input;
  const [rate] = await sql<{ rate_per_sq_ft: number }>`
    select rate_per_sq_ft
    from city_pincode_rates
    where city = ${city.trim()}
      and pincode = ${pincode.trim()}
      and is_active = true
    limit 1
  `;

  if (!rate) {
    return {
      ok: false as const,
      error: "No pricing available for the selected city and pincode.",
    };
  }

  const base = squareFeet * rate.rate_per_sq_ft;
  const propertyMultiplier = propertyType === "villa" ? 1.08 : 1;
  const roomModifier = rooms > 3 ? 1.05 : 1;

  const adjusted = Math.round(base * propertyMultiplier * roomModifier);
  const min = Math.round(adjusted * 0.9);
  const max = Math.round(adjusted * 1.1);

  return {
    ok: true as const,
    data: {
      min,
      max,
      currency: "INR",
      breakdown: {
        ratePerSqFt: rate.rate_per_sq_ft,
        squareFeet,
        propertyMultiplier,
        roomModifier,
        adjusted,
      },
      disclaimer:
        "Estimate is based on admin-configured ₹/sqft rates. Final pricing depends on scope and materials.",
      // TODO: Replace deterministic modifiers with AI/LLM estimator module.
    },
  };
}
