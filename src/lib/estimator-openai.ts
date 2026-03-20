import OpenAI from "openai";
import { env } from "@/lib/env";
import { ESTIMATOR_AI_SYSTEM_PROMPT } from "@/lib/estimator-ai-prompt";
import type { EstimatorApiData, EstimatorClientPayload } from "@/lib/estimator-types";
import { estimateCost } from "@/lib/estimator";
import { roomsFromBhk } from "@/lib/estimator-api-validate";

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function tierLabel(tier: EstimatorClientPayload["interiorTier"]): string {
  const map = { basic: "Basic", standard: "Standard", premium: "Premium", luxury: "Luxury" };
  return map[tier];
}

/** Parse model JSON into EstimatorApiData; returns null if invalid. */
export function parseOpenAiEstimateJson(
  raw: string,
  input: EstimatorClientPayload
): EstimatorApiData | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  const b = o.breakdown && typeof o.breakdown === "object" ? (o.breakdown as Record<string, unknown>) : {};

  const minTotal = num(o.minTotal);
  const maxTotal = num(o.maxTotal);
  if (minTotal <= 0 || maxTotal <= 0 || minTotal > maxTotal) return null;

  const breakdown = {
    kitchen: num(b.kitchen),
    wardrobes: num(b.wardrobes),
    tvUnit: num(b.tvUnit ?? b.tv_unit),
    falseCeiling: num(b.falseCeiling ?? b.false_ceiling),
    lighting: num(b.lighting),
    others: num(b.others),
  };

  const disclaimer =
    typeof o.disclaimer === "string" && o.disclaimer.trim()
      ? o.disclaimer.trim()
      : "This is an approximate estimate based on average market pricing. Final cost may vary depending on site conditions, design complexity, materials, and labor.";

  return {
    source: "openai",
    min: minTotal,
    max: maxTotal,
    currency: "INR",
    flatSizeSqFt: num(o.flatSizeSqFt, input.squareFeet) || input.squareFeet,
    interiorType: typeof o.interiorType === "string" ? o.interiorType : tierLabel(input.interiorTier),
    timelineWeeks: Math.max(1, num(o.timelineWeeks, 8)),
    breakdown,
    disclaimer,
  };
}

export async function estimateInteriorWithOpenAI(
  input: EstimatorClientPayload
): Promise<EstimatorApiData | null> {
  if (!env.openaiApiKey) return null;

  const client = new OpenAI({ apiKey: env.openaiApiKey });
  const completion = await client.chat.completions.create({
    model: env.openaiModel,
    response_format: { type: "json_object" },
    temperature: 0.35,
    messages: [
      { role: "system", content: ESTIMATOR_AI_SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          city: input.city,
          pincode: input.pincode || undefined,
          squareFeet: input.squareFeet,
          bhk: input.bhk,
          interiorTier: input.interiorTier,
          areasSelected: input.areas,
          material: input.material,
          possession: input.possession,
          budgetNote: input.budgetNote,
          propertyType: input.propertyType,
        }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return null;
  return parseOpenAiEstimateJson(raw, input);
}

/** Deterministic fallback using DB rates + formula from estimator.ts */
export async function estimateInteriorFormula(
  input: EstimatorClientPayload
): Promise<EstimatorApiData | null> {
  const pincode = input.pincode.trim() || "000000";
  const rooms = roomsFromBhk(input.bhk);
  const result = await estimateCost({
    city: input.city.trim(),
    pincode,
    area: input.squareFeet,
    areaUnit: "sqft",
    propertyType: input.propertyType,
    rooms,
  });

  if (!result.ok) return null;

  const { min, max, breakdown, disclaimer } = result.data;
  const mid = (min + max) / 2;
  const k = 0.22,
    w = 0.28,
    t = 0.12,
    f = 0.14,
    l = 0.1;
  const sum = k + w + t + f + l;
  const rest = Math.max(0, mid * (1 - sum));

  return {
    source: "formula",
    min,
    max,
    currency: "INR",
    flatSizeSqFt: breakdown.squareFeet,
    interiorType: tierLabel(input.interiorTier),
    timelineWeeks: input.possession === "under_construction" ? 14 : 10,
    breakdown: {
      kitchen: Math.round(mid * k),
      wardrobes: Math.round(mid * w),
      tvUnit: Math.round(mid * t),
      falseCeiling: Math.round(mid * f),
      lighting: Math.round(mid * l),
      others: Math.round(rest),
    },
    disclaimer,
  };
}
