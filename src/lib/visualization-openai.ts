import { buildVisualizationSystemPrompt } from "@/lib/ai-prompts";
import { getAdminSettings } from "@/lib/settings";
import { createOpenAiImageClient, createTextLlmClient, resolveLlmSettings } from "@/lib/llm";

export type VisualizationInputType = "floorplan" | "room_photo";

export type VisualizationRequest = {
  imageDataUrl?: string;
  pdfPageImages?: string[];
  pdfExtractedText?: string;
  inputType: VisualizationInputType;
  interiorStyle: string;
  sourceFileType?: "image" | "pdf";
  customBrief?: string;
  preferredRoomCount?: number | null;
};

export type VisualizationRoomConcept = {
  id: string;
  name: string;
  rationale: string;
  prompt: string;
  renderImageUrl?: string;
};

export type VisualizationResult = {
  summary: string;
  detectedImageType: VisualizationInputType;
  rooms: VisualizationRoomConcept[];
};

function sanitizeRoomName(name: unknown, idx: number): string {
  const raw = typeof name === "string" ? name.trim() : "";
  if (!raw) return `Room ${idx + 1}`;
  return raw.slice(0, 48);
}

function normalizeDetectedType(v: unknown, fallback: VisualizationInputType): VisualizationInputType {
  if (v === "floorplan" || v === "room_photo") return v;
  return fallback;
}

function parseAnalysisJson(raw: string, fallbackType: VisualizationInputType): VisualizationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("AI analysis returned invalid JSON.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI analysis returned an invalid structure.");
  }
  const o = parsed as Record<string, unknown>;
  const detectedImageType = normalizeDetectedType(o.detectedImageType, fallbackType);
  const summary =
    typeof o.summary === "string" && o.summary.trim()
      ? o.summary.trim().slice(0, 500)
      : "Generated design concepts based on your uploaded image.";
  const roomArr = Array.isArray(o.rooms) ? o.rooms : [];
  const rooms = roomArr
    .map((r, idx) => {
      const ro = r && typeof r === "object" ? (r as Record<string, unknown>) : null;
      if (!ro) return null;
      const prompt = typeof ro.prompt === "string" ? ro.prompt.trim() : "";
      if (!prompt) return null;
      return {
        id: `room-${idx + 1}`,
        name: sanitizeRoomName(ro.name, idx),
        rationale:
          typeof ro.rationale === "string" && ro.rationale.trim()
            ? ro.rationale.trim().slice(0, 240)
            : "AI suggestion based on the uploaded plan/photo and selected style.",
        prompt: prompt.slice(0, 1400),
      };
    })
    .filter((x): x is { id: string; name: string; rationale: string; prompt: string } => Boolean(x));
  if (!rooms.length) {
    throw new Error("AI analysis did not produce any room concepts.");
  }
  return { summary, detectedImageType, rooms };
}

export async function generateVisualizationConcepts(input: VisualizationRequest): Promise<VisualizationResult> {
  const settings = await getAdminSettings();
  const systemPrompt = buildVisualizationSystemPrompt(settings.visualizationPromptCustom);
  const llm = resolveLlmSettings({
    llmProvider: settings.llmProvider,
    llmModel: settings.llmModel,
    llmImageModel: settings.llmImageModel,
  });
  const textClient = createTextLlmClient(llm.provider);

  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [
    {
      type: "text",
      text: [
        `Input type selected by user: ${input.inputType}.`,
        `Interior style selected by user: ${input.interiorStyle}.`,
        `Original file format uploaded by user: ${input.sourceFileType ?? "image"}.`,
        `Additional preferences from user: ${input.customBrief?.trim() || "none"}.`,
        `Preferred room count: ${input.preferredRoomCount ?? "auto"}.`,
        input.pdfExtractedText?.trim()
          ? `Extracted PDF text context:\n${input.pdfExtractedText.trim().slice(0, 5000)}`
          : "Extracted PDF text context: none.",
        "Return JSON with this exact structure:",
        "{",
        '  "detectedImageType": "floorplan" | "room_photo",',
        '  "summary": "short summary",',
        '  "rooms": [',
        '    {"name":"Living Room","rationale":"why this design","prompt":"high quality image prompt for generation"}',
        "  ]",
        "}",
        "If original file format is PDF, treat the images as rendered pages from PDF and interpret room labels/lines accordingly.",
        "For floorplan: infer likely major rooms and circulation. For room photo: infer one or more zones from image context.",
        "Each prompt should be photoreal interior design render, detailed materials, lighting, camera angle, and Indian apartment/home context.",
      ].join("\n"),
    },
  ];
  for (const img of (input.pdfPageImages ?? []).filter(Boolean).slice(0, 3)) {
    userContent.push({ type: "image_url", image_url: { url: img } });
  }
  if (input.imageDataUrl) {
    userContent.push({ type: "image_url", image_url: { url: input.imageDataUrl } });
  }
  if (userContent.length === 1) {
    throw new Error("No valid image context was provided for visualization.");
  }

  const analysis = await textClient.chat.completions.create({
    model: llm.textModel,
    response_format: { type: "json_object" },
    temperature: 0.55,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: userContent },
    ],
  });

  const raw = analysis.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("AI analysis returned empty output.");
  }
  const parsed = parseAnalysisJson(raw, input.inputType);

  const requestedCount =
    typeof input.preferredRoomCount === "number" && Number.isFinite(input.preferredRoomCount)
      ? Math.min(5, Math.max(1, Math.round(input.preferredRoomCount)))
      : 3;
  const roomsToRender = parsed.rooms.slice(0, requestedCount);
  const imageClient = createOpenAiImageClient();
  if (!imageClient) {
    return {
      summary: parsed.summary,
      detectedImageType: parsed.detectedImageType,
      rooms: roomsToRender,
    };
  }
  const renderedRooms = await Promise.all(
    roomsToRender.map(async (room) => {
      try {
        const imagePrompt = [
          room.prompt,
          `Style: ${input.interiorStyle}.`,
          input.customBrief?.trim() ? `User preferences: ${input.customBrief.trim()}.` : "",
          "Keep output practical and buildable.",
        ]
          .filter(Boolean)
          .join("\n");
        const image = await imageClient.images.generate({
          model: llm.imageModel,
          prompt: imagePrompt,
          size: "1024x1024",
        });
        const b64 = image.data?.[0]?.b64_json;
        const renderImageUrl = b64 ? `data:image/png;base64,${b64}` : image.data?.[0]?.url;
        return {
          ...room,
          ...(renderImageUrl ? { renderImageUrl } : {}),
        };
      } catch (e) {
        console.error("Visualization image generation failed for room:", room.name, e);
        return room;
      }
    })
  );

  return {
    summary: parsed.summary,
    detectedImageType: parsed.detectedImageType,
    rooms: renderedRooms,
  };
}

