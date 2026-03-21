"use client";

import { useMemo, useState } from "react";
import { Camera, Cuboid, ImagePlus, Loader2, Sparkles } from "lucide-react";

type InputType = "floorplan" | "room_photo";

type VisualizationRoom = {
  id: string;
  name: string;
  rationale: string;
  prompt: string;
  renderImageUrl?: string;
};

type VisualizationResponse = {
  summary: string;
  detectedImageType: InputType;
  rooms: VisualizationRoom[];
};

const STYLE_OPTIONS = [
  "Modern",
  "Contemporary",
  "Minimal",
  "Scandinavian",
  "Industrial",
  "Traditional",
  "Luxury",
] as const;

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

export default function VisualizationStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<InputType>("room_photo");
  const [interiorStyle, setInteriorStyle] = useState<(typeof STYLE_OPTIONS)[number]>("Modern");
  const [roomCountPref, setRoomCountPref] = useState<"auto" | "1" | "2" | "3" | "4" | "5" | "6">("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VisualizationResponse | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string>("");

  const activeRoom = useMemo(
    () => result?.rooms.find((room) => room.id === activeRoomId) ?? result?.rooms[0] ?? null,
    [result, activeRoomId]
  );

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please upload a floorplan or room photo.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Please upload an image under 8MB.");
      return;
    }

    setLoading(true);
    try {
      const imageDataUrl = await fileToDataUrl(file);
      const response = await fetch("/api/visualization/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl,
          inputType,
          interiorStyle,
          ...(roomCountPref !== "auto" ? { preferredRoomCount: Number(roomCountPref) } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to generate visualization.");
      }
      const payload = data as VisualizationResponse;
      setResult(payload);
      setActiveRoomId(payload.rooms[0]?.id ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate visualization.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="heading-md mb-1">AI Visualization Studio</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Upload a floorplan or room image. The AI infers room experience and generates room-wise design concepts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={handleGenerate} className="card space-y-5">
          <div>
            <h3 className="font-semibold text-[var(--foreground)] mb-3">1) Upload image</h3>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)]/70 p-4 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] transition-colors">
              <ImagePlus className="h-4 w-4" />
              <span>{file ? file.name : "Choose floorplan or room photo"}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--foreground)] mb-3">2) Input type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInputType("floorplan")}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                  inputType === "floorplan"
                    ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]"
                    : "border-[var(--border)] bg-white text-[var(--text-muted)]"
                }`}
              >
                <Cuboid className="h-4 w-4 mx-auto mb-1" />
                Floorplan
              </button>
              <button
                type="button"
                onClick={() => setInputType("room_photo")}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                  inputType === "room_photo"
                    ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]"
                    : "border-[var(--border)] bg-white text-[var(--text-muted)]"
                }`}
              >
                <Camera className="h-4 w-4 mx-auto mb-1" />
                Room photo
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-[var(--text-muted)]">
              <span className="block mb-1.5">Interior style</span>
              <select
                className="input"
                value={interiorStyle}
                onChange={(e) => setInteriorStyle(e.target.value as (typeof STYLE_OPTIONS)[number])}
              >
                {STYLE_OPTIONS.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-[var(--text-muted)]">
              <span className="block mb-1.5">Room count preference</span>
              <select
                className="input"
                value={roomCountPref}
                onChange={(e) => setRoomCountPref(e.target.value as typeof roomCountPref)}
              >
                <option value="auto">Auto detect</option>
                <option value="1">1 room</option>
                <option value="2">2 rooms</option>
                <option value="3">3 rooms</option>
                <option value="4">4 rooms</option>
                <option value="5">5 rooms</option>
                <option value="6">6 rooms</option>
              </select>
            </label>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button type="submit" disabled={loading} className="btn btn-primary w-full inline-flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating concepts...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate interior concepts
              </>
            )}
          </button>
        </form>

        <div className="card min-h-[480px]">
          {!result ? (
            <div className="h-full flex items-center justify-center text-center text-sm text-[var(--text-muted)] px-6">
              Upload an image and generate concepts. The UI adapts automatically when AI detects more rooms.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/60 p-3">
                <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)] mb-1">AI summary</p>
                <p className="text-sm text-[var(--foreground)]">{result.summary}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Detected image type:{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {result.detectedImageType === "floorplan" ? "Floorplan" : "Room photo"}
                  </span>{" "}
                  · Rooms generated:{" "}
                  <span className="font-medium text-[var(--foreground)]">{result.rooms.length}</span>
                </p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {result.rooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setActiveRoomId(room.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                      activeRoom?.id === room.id
                        ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]"
                        : "border-[var(--border)] bg-white text-[var(--text-muted)]"
                    }`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>

              {activeRoom ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface-subtle)]">
                    {activeRoom.renderImageUrl ? (
                      <img
                        src={activeRoom.renderImageUrl}
                        alt={`${activeRoom.name} AI concept`}
                        className="w-full h-[320px] object-cover"
                      />
                    ) : (
                      <div className="h-[320px] flex items-center justify-center text-sm text-[var(--text-muted)] px-4 text-center">
                        Image rendering unavailable for this room right now. You can still use the generated prompt.
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-[var(--border)] p-3">
                    <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)] mb-1">Design intent</p>
                    <p className="text-sm text-[var(--foreground)] mb-3">{activeRoom.rationale}</p>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)] mb-1">Prompt used</p>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{activeRoom.prompt}</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

