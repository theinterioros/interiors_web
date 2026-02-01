import { sql } from "@/lib/db";

export type AreaUnit = "sqft" | "sqyd" | "sqm";

type EstimateInput = {
  city: string;
  pincode: string;
  area: number;
  areaUnit: AreaUnit;
  propertyType: "apartment" | "villa";
  rooms: number;
};

const DEFAULT_CITY = "DEFAULT";
const DEFAULT_PINCODE = "*";

function areaToSqFt(area: number, unit: AreaUnit): number {
  if (unit === "sqft") return area;
  if (unit === "sqyd") return area * 9;
  return area * 10.7639; // sqm
}

export async function estimateCost(input: EstimateInput) {
  const { city, pincode, area, areaUnit, propertyType, rooms } = input;
  const cityTrim = city.trim();
  const pincodeTrim = pincode.trim();
  const squareFeet = areaToSqFt(area, areaUnit);

  type RateRow = { rate_per_sq_ft: number; rate_per_sq_yd?: number | null; rate_per_sq_m?: number | null };

  async function fetchRate(city: string, pincode: string): Promise<RateRow | undefined> {
    try {
      const [row] = await sql<RateRow>`
        select rate_per_sq_ft, rate_per_sq_yd, rate_per_sq_m
        from city_pincode_rates
        where city = ${city} and pincode = ${pincode} and is_active = true
        limit 1
      `;
      return row;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("rate_per_sq_yd") || message.includes("rate_per_sq_m")) {
        const [row] = await sql<{ rate_per_sq_ft: number }>`
          select rate_per_sq_ft
          from city_pincode_rates
          where city = ${city} and pincode = ${pincode} and is_active = true
          limit 1
        `;
        return row ? { rate_per_sq_ft: row.rate_per_sq_ft } : undefined;
      }
      throw err;
    }
  }

  const specificRate = await fetchRate(cityTrim, pincodeTrim);
  const defaultRate = specificRate ? undefined : await fetchRate(DEFAULT_CITY, DEFAULT_PINCODE);
  const rate = specificRate ?? defaultRate;

  if (!rate || !rate.rate_per_sq_ft) {
    return {
      ok: false as const,
      error: "No pricing available for the selected city and pincode. Set a default rate in Admin → AI Estimator pricing.",
    };
  }

  let ratePerSqFt: number;
  if (areaUnit === "sqft") {
    ratePerSqFt = rate.rate_per_sq_ft;
  } else if (areaUnit === "sqyd") {
    const ratePerSqYd = rate.rate_per_sq_yd ?? rate.rate_per_sq_ft / 9;
    ratePerSqFt = ratePerSqYd / 9;
  } else {
    const ratePerSqM = rate.rate_per_sq_m ?? rate.rate_per_sq_ft / 10.7639;
    ratePerSqFt = ratePerSqM / 10.7639;
  }

  const base = squareFeet * ratePerSqFt;
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
        ratePerSqFt,
        squareFeet: Math.round(squareFeet),
        propertyMultiplier,
        roomModifier,
        adjusted,
      },
      disclaimer:
        "Estimate is based on admin-configured rates. Final pricing depends on scope and materials.",
    },
  };
}
