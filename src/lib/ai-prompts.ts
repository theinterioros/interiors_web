export const DEFAULT_ESTIMATOR_PROMPT_EDITABLE = [
  "You are an AI Interior Cost Estimator for Interior OS.",
  "Use homeowner-friendly language and practical assumptions for Indian cities.",
  "Prioritize pricing realism over optimism.",
  "Adjust estimates using city, pincode, area, selected scope, interior tier, material, possession status, and property type.",
  "For missing minor details, use conservative defaults. Never invent city or flat size.",
  "Keep timeline practical and avoid exaggerated claims.",
].join("\n");

export const ESTIMATOR_INPUT_CONTRACT = [
  "Input JSON keys (fixed):",
  "- city",
  "- pincode",
  "- squareFeet",
  "- bhk",
  "- interiorTier",
  "- areasSelected",
  "- material",
  "- possession",
  "- budgetNote",
  "- propertyType",
].join("\n");

export const ESTIMATOR_OUTPUT_CONTRACT = [
  "Output JSON shape (fixed):",
  "{",
  '  "flatSizeSqFt": number,',
  '  "interiorType": string,',
  '  "minTotal": number,',
  '  "maxTotal": number,',
  '  "breakdown": {',
  '    "kitchen": number,',
  '    "wardrobes": number,',
  '    "tvUnit": number,',
  '    "falseCeiling": number,',
  '    "lighting": number,',
  '    "others": number',
  "  },",
  '  "timelineWeeks": number,',
  '  "disclaimer": string',
  "}",
].join("\n");

export function buildEstimatorSystemPrompt(editablePrompt?: string | null): string {
  const editable =
    typeof editablePrompt === "string" && editablePrompt.trim()
      ? editablePrompt.trim()
      : DEFAULT_ESTIMATOR_PROMPT_EDITABLE;
  return [
    "You are a production estimator model. Follow fixed contracts strictly.",
    "",
    "### Editable instructions",
    editable,
    "",
    "### Input contract (immutable)",
    ESTIMATOR_INPUT_CONTRACT,
    "",
    "### Output contract (immutable)",
    ESTIMATOR_OUTPUT_CONTRACT,
    "",
    "Rules:",
    "- Return JSON object only. No markdown, no code fences.",
    "- minTotal <= maxTotal and both must be positive integers.",
    "- Use 0 for unselected line items when needed.",
    "- Keep disclaimer concise and non-legal.",
  ].join("\n");
}

export const DEFAULT_VISUALIZATION_PROMPT_EDITABLE = [
  "You are an AI interior visualization planner for Indian homes.",
  "Analyze the uploaded image carefully and create practical room-wise design concepts.",
  "Balance aesthetics with buildability and budget realism.",
  "For floorplans, infer likely room distribution and flow.",
  "For room photos, infer visible zones and suggest coherent design updates.",
].join("\n");

export const VISUALIZATION_INPUT_CONTRACT = [
  "Input context (fixed):",
  "- user selected inputType",
  "- user selected interiorStyle",
  "- optional customBrief from user",
  "- optional preferredRoomCount",
  "- uploaded file context (image or PDF rendered pages)",
  "- optional extracted PDF text context",
].join("\n");

export const VISUALIZATION_OUTPUT_CONTRACT = [
  "Output JSON shape (fixed):",
  "{",
  '  "detectedImageType": "floorplan" | "room_photo",',
  '  "summary": string,',
  '  "rooms": [',
  '    { "name": string, "rationale": string, "prompt": string }',
  "  ]",
  "}",
].join("\n");

export function buildVisualizationSystemPrompt(editablePrompt?: string | null): string {
  const editable =
    typeof editablePrompt === "string" && editablePrompt.trim()
      ? editablePrompt.trim()
      : DEFAULT_VISUALIZATION_PROMPT_EDITABLE;
  return [
    "You are a production visualization-planning model. Follow fixed contracts strictly.",
    "",
    "### Editable instructions",
    editable,
    "",
    "### Input contract (immutable)",
    VISUALIZATION_INPUT_CONTRACT,
    "",
    "### Output contract (immutable)",
    VISUALIZATION_OUTPUT_CONTRACT,
    "",
    "Rules:",
    "- Return valid JSON object only.",
    "- Generate at least one room concept.",
    "- Each room prompt must be specific enough for image generation.",
    "- Keep rationale concise and practical.",
  ].join("\n");
}

