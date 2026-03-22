import type { EstimatorApiData, EstimatorClientPayload } from "@/lib/estimator-types";
import { estimateCost } from "@/lib/estimator";
import { roomsFromBhk } from "@/lib/estimator-api-validate";
import { buildEstimatorSystemPrompt } from "@/lib/ai-prompts";
import { getAdminSettings } from "@/lib/settings";
import { createTextLlmClient, resolveLlmSettings } from "@/lib/llm";

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : fallback;
  if (typeof v === "string") {
    // Accept values like "1,23,456", "₹123456", "123456.00" etc.
    const cleaned = v.replace(/,/g, "").replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? Math.round(n) : fallback;
  }
  const n = Number(v);
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

  const minTotal = num(o.minTotal ?? o.min_total ?? o.minCost ?? o.min_cost);
  const maxTotal = num(o.maxTotal ?? o.max_total ?? o.maxCost ?? o.max_cost);
  if (minTotal <= 0 || maxTotal <= 0 || minTotal > maxTotal) return null;

  const breakdown = {
    kitchen: num(b.kitchen),
    wardrobes: num(b.wardrobes),
    tvUnit: num(b.tvUnit ?? b.tv_unit ?? b.tvunit ?? b.tv_unit_price),
    falseCeiling: num(b.falseCeiling ?? b.false_ceiling ?? b.falseceiling ?? b.false_ceiling_cost),
    lighting: num(b.lighting ?? b.lights),
    others: num(b.others ?? b.other ?? b.misc),
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
  const settings = await getAdminSettings();
  const systemPrompt = buildEstimatorSystemPrompt(settings.estimatorPromptCustom);
  const llm = resolveLlmSettings({
    llmProvider: settings.estimatorLlmProvider,
    llmModel: settings.estimatorLlmModel,
  });
  const client = createTextLlmClient(llm.provider);
  const completion = await client.chat.completions.create({
    model: llm.textModel,
    response_format: { type: "json_object" },
    temperature: 0.35,
    messages: [
      { role: "system", content: systemPrompt },
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
  if (!raw) {
    console.error("OpenAI estimator returned empty content.");
    return null;
  }
  const parsed = parseOpenAiEstimateJson(raw, input);
  if (!parsed) {
    // Helpful diagnostics: OpenAI might return valid JSON but not in the exact schema we expect.
    // This is logged only on parse failure; it does not change the API response shape.
    try {
      const o = JSON.parse(raw) as Record<string, unknown>;
      const topKeys = Object.keys(o ?? {});
      console.error("OpenAI estimator parse failure. Top keys:", topKeys);
    } catch {
      // ignore
    }
    console.error("OpenAI estimator parse failure. Raw (truncated):", raw.slice(0, 500));
  }
  return parsed;
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
