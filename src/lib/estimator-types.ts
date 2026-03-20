/** Shared types for AI / formula interior cost estimator API */

export const ESTIMATOR_BHK = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"] as const;
export type EstimatorBhk = (typeof ESTIMATOR_BHK)[number];

export const ESTIMATOR_TIERS = ["basic", "standard", "premium", "luxury"] as const;
export type EstimatorInteriorTier = (typeof ESTIMATOR_TIERS)[number];

export const ESTIMATOR_MATERIALS = ["laminate", "acrylic", "pu_finish", "veneer"] as const;
export type EstimatorMaterial = (typeof ESTIMATOR_MATERIALS)[number];

export const ESTIMATOR_POSSESSION = ["ready", "under_construction"] as const;
export type EstimatorPossession = (typeof ESTIMATOR_POSSESSION)[number];

/** Checkbox keys sent from the client (snake_case for API stability) */
export const ESTIMATOR_AREA_OPTIONS = [
  { key: "kitchen", label: "Kitchen" },
  { key: "wardrobes", label: "Wardrobes" },
  { key: "tv_unit", label: "TV Unit" },
  { key: "false_ceiling", label: "False Ceiling" },
  { key: "lighting", label: "Lighting" },
  { key: "crockery_unit", label: "Crockery Unit" },
  { key: "study_table", label: "Study Table" },
  { key: "shoe_rack", label: "Shoe Rack" },
] as const;

export type EstimatorAreaOptionKey = (typeof ESTIMATOR_AREA_OPTIONS)[number]["key"];

/** Normalized payload after POST /api/estimator validation */
export type EstimatorClientPayload = {
  city: string;
  pincode: string;
  squareFeet: number;
  bhk: EstimatorBhk;
  interiorTier: EstimatorInteriorTier;
  areas: EstimatorAreaOptionKey[];
  material: EstimatorMaterial;
  possession: EstimatorPossession;
  budgetNote?: string;
  propertyType: "apartment" | "villa";
};

/** JSON returned to the client */
export type EstimatorApiData = {
  source: "openai" | "formula";
  min: number;
  max: number;
  currency: "INR";
  flatSizeSqFt: number;
  interiorType: string;
  timelineWeeks: number;
  breakdown: {
    kitchen: number;
    wardrobes: number;
    tvUnit: number;
    falseCeiling: number;
    lighting: number;
    others: number;
  };
  disclaimer: string;
};
