import {
  ESTIMATOR_AREA_OPTIONS,
  ESTIMATOR_BHK,
  ESTIMATOR_MATERIALS,
  ESTIMATOR_POSSESSION,
  ESTIMATOR_TIERS,
  type EstimatorAreaOptionKey,
  type EstimatorClientPayload,
} from "@/lib/estimator-types";

const AREA_KEYS = new Set<string>(ESTIMATOR_AREA_OPTIONS.map((a) => a.key));

function normalizeAreaUnit(raw: string): "sqft" | "sqyd" | "sqm" {
  const u = raw.trim().toUpperCase().replace(/\./g, "").replace(/\s+/g, "");
  if (u === "SQM" || u === "SQ M") return "sqm";
  if (u === "SQYD") return "sqyd";
  if (u === "SQFT" || u === "SFT") return "sqft";
  const l = raw.trim().toLowerCase();
  if (l === "sqm" || l === "sqyd" || l === "sqft") return l;
  return "sqft";
}

function parseAreas(raw: unknown): EstimatorAreaOptionKey[] {
  if (!Array.isArray(raw)) return [];
  const out: EstimatorAreaOptionKey[] = [];
  for (const x of raw) {
    const k = String(x);
    if (AREA_KEYS.has(k)) out.push(k as EstimatorAreaOptionKey);
  }
  return out;
}

export type EstimatorBodyParse =
  | { ok: true; data: EstimatorClientPayload }
  | { ok: false; error: string };

/** Validate POST /api/estimator JSON into EstimatorClientPayload */
export function parseEstimatorRequestBody(body: Record<string, unknown>): EstimatorBodyParse {
  const city = String(body.city ?? "").trim();
  const pincode = String(body.pincode ?? "").trim();
  const directSqft = Number(body.squareFeet ?? NaN);
  const areaRaw = body.area;
  const area = typeof areaRaw === "number" ? areaRaw : Number(areaRaw ?? NaN);
  const normalizedUnit = normalizeAreaUnit(String(body.areaUnit ?? "sqft"));

  if (!pincode) {
    return { ok: false, error: "Pincode is required." };
  }
  if (!/^\d{6}$/.test(pincode)) {
    return { ok: false, error: "Pincode must be exactly 6 digits." };
  }
  // keep as trimmed digits only

  const useDirectSqft = Number.isFinite(directSqft) && directSqft > 0 && !Number.isFinite(area);

  let squareFeet: number;
  if (useDirectSqft) {
    squareFeet = Math.round(directSqft);
  } else if (Number.isFinite(area) && area > 0) {
    let sq = area;
    if (normalizedUnit === "sqyd") sq = area * 9;
    else if (normalizedUnit === "sqm") sq = area * 10.7639;
    squareFeet = Math.round(sq);
  } else {
    return { ok: false, error: "Carpet area must be a positive number." };
  }

  if (!city) {
    return { ok: false, error: "City is required." };
  }
  const minSqft = useDirectSqft ? 100 : normalizedUnit === "sqyd" ? 12 : normalizedUnit === "sqm" ? 10 : 100;
  if (squareFeet < minSqft) {
    return { ok: false, error: "Carpet area is too small for a valid estimate." };
  }

  const bhkRaw = String(body.bhk ?? body.configuration ?? "2BHK").toUpperCase();
  const bhk = ESTIMATOR_BHK.includes(bhkRaw as (typeof ESTIMATOR_BHK)[number])
    ? (bhkRaw as (typeof ESTIMATOR_BHK)[number])
    : "2BHK";

  const tierRaw = String(body.interiorTier ?? body.interior_tier ?? "standard").toLowerCase();
  const interiorTier = ESTIMATOR_TIERS.includes(tierRaw as (typeof ESTIMATOR_TIERS)[number])
    ? (tierRaw as (typeof ESTIMATOR_TIERS)[number])
    : "standard";

  const matRaw = String(body.material ?? "laminate").toLowerCase().replace(/\s+/g, "_");
  const material =
    matRaw === "pu" || matRaw === "pu_finish"
      ? "pu_finish"
      : ESTIMATOR_MATERIALS.includes(matRaw as (typeof ESTIMATOR_MATERIALS)[number])
        ? (matRaw as (typeof ESTIMATOR_MATERIALS)[number])
        : "laminate";

  const posRaw = String(body.possession ?? "ready").toLowerCase().replace(/-/g, "_");
  const possession = ESTIMATOR_POSSESSION.includes(posRaw as (typeof ESTIMATOR_POSSESSION)[number])
    ? (posRaw as (typeof ESTIMATOR_POSSESSION)[number])
    : "ready";

  let areas = parseAreas(body.areas);
  if (areas.length === 0) {
    areas = ["kitchen", "wardrobes", "tv_unit", "false_ceiling", "lighting"];
  }

  const budgetNote =
    typeof body.budgetNote === "string"
      ? body.budgetNote.trim().slice(0, 500)
      : typeof body.budgetExpectation === "string"
        ? body.budgetExpectation.trim().slice(0, 500)
        : undefined;

  const propertyType = body.propertyType === "villa" ? "villa" : "apartment";

  return {
    ok: true,
    data: {
      city,
      pincode,
      squareFeet,
      bhk,
      interiorTier,
      areas,
      material,
      possession,
      budgetNote: budgetNote || undefined,
      propertyType,
    },
  };
}

export function roomsFromBhk(bhk: EstimatorClientPayload["bhk"]): number {
  const n = parseInt(bhk.charAt(0), 10);
  return Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 2;
}
