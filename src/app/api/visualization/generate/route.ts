import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { generateVisualizationConcepts, type VisualizationInputType } from "@/lib/visualization-openai";

export const runtime = "nodejs";

const ALLOWED_STYLES = [
  "Modern",
  "Contemporary",
  "Minimal",
  "Scandinavian",
  "Industrial",
  "Traditional",
  "Luxury",
] as const;

function isDataImageUrl(v: string): boolean {
  return /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(v);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const imageDataUrl = String(body.imageDataUrl ?? "").trim();
  const interiorStyle = String(body.interiorStyle ?? "").trim();
  const inputTypeRaw = String(body.inputType ?? "").trim();
  const inputType: VisualizationInputType =
    inputTypeRaw === "floorplan" ? "floorplan" : inputTypeRaw === "room_photo" ? "room_photo" : "room_photo";
  const preferredRoomCountRaw = Number(body.preferredRoomCount);
  const preferredRoomCount = Number.isFinite(preferredRoomCountRaw)
    ? Math.min(8, Math.max(1, Math.round(preferredRoomCountRaw)))
    : null;

  if (!isDataImageUrl(imageDataUrl)) {
    return NextResponse.json({ error: "Please upload a valid image (PNG/JPG/WEBP)." }, { status: 400 });
  }
  if (!ALLOWED_STYLES.includes(interiorStyle as (typeof ALLOWED_STYLES)[number])) {
    return NextResponse.json({ error: "Please select a valid interior style." }, { status: 400 });
  }

  try {
    const result = await generateVisualizationConcepts({
      imageDataUrl,
      inputType,
      interiorStyle,
      ...(preferredRoomCount ? { preferredRoomCount } : {}),
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("Visualization generation failed:", e);
    const message = e instanceof Error ? e.message : "Unable to generate visualization right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

