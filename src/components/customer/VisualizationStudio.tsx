"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, Cuboid, ImagePlus, Loader2, Sparkles } from "lucide-react";
import {
  getVisualizationSessionState,
  setVisualizationSessionState,
  type VisualizationSessionState,
} from "@/lib/visualization-session-store";

type InputType = "floorplan" | "room_photo";
type UploadedSourceType = "image" | "pdf";

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

async function pdfFileToContext(
  file: File
): Promise<{ pageImages: string[]; extractedText: string }> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const maxPages = Math.min(3, pdf.numPages);
  const pageImages: string[] = [];
  let extractedText = "";

  for (let i = 1; i <= maxPages; i += 1) {
    const page = await pdf.getPage(i);
    // Use higher scale for clearer room labels in floorplans.
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to process PDF.");
    }
    await page.render({ canvasContext: context, viewport, canvas }).promise;
    pageImages.push(canvas.toDataURL("image/png"));

    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? String(item.str) : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) {
      extractedText += (extractedText ? "\n" : "") + `Page ${i}: ${pageText}`;
    }
  }
  return { pageImages, extractedText: extractedText.slice(0, 6000) };
}

export default function VisualizationStudio() {
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState("");
  const [uploadedPdfPageImages, setUploadedPdfPageImages] = useState<string[]>([]);
  const [uploadedPdfExtractedText, setUploadedPdfExtractedText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedSourceType, setUploadedSourceType] = useState<UploadedSourceType>("image");
  const [inputType, setInputType] = useState<InputType>("room_photo");
  const [interiorStyle, setInteriorStyle] = useState<(typeof STYLE_OPTIONS)[number]>("Modern");
  const [roomCountPref, setRoomCountPref] = useState<"auto" | "1" | "2" | "3" | "4" | "5" | "6">("auto");
  const [customBrief, setCustomBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VisualizationResponse | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  const activeRoom = useMemo(
    () => result?.rooms.find((room) => room.id === activeRoomId) ?? result?.rooms[0] ?? null,
    [result, activeRoomId]
  );

  useEffect(() => {
    const snapshot = getVisualizationSessionState();
    if (snapshot) {
      setInputType(snapshot.inputType);
      setInteriorStyle(
        STYLE_OPTIONS.includes(snapshot.interiorStyle as (typeof STYLE_OPTIONS)[number])
          ? (snapshot.interiorStyle as (typeof STYLE_OPTIONS)[number])
          : "Modern"
      );
      setRoomCountPref(snapshot.roomCountPref);
      setCustomBrief(snapshot.customBrief);
      setResult(snapshot.result);
      setActiveRoomId(snapshot.activeRoomId);
      setUploadedFileName(snapshot.uploadedFileName);
      setUploadedImageDataUrl(snapshot.uploadedImageDataUrl);
      setUploadedPdfPageImages(snapshot.uploadedPdfPageImages ?? []);
      setUploadedPdfExtractedText(snapshot.uploadedPdfExtractedText ?? "");
      setUploadedSourceType(snapshot.sourceFileType ?? "image");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const snapshot: VisualizationSessionState = {
      inputType,
      interiorStyle,
      roomCountPref,
      customBrief,
      result,
      activeRoomId,
      uploadedFileName,
      sourceFileType: uploadedSourceType,
      uploadedImageDataUrl,
      uploadedPdfPageImages,
      uploadedPdfExtractedText,
    };
    setVisualizationSessionState(snapshot);
  }, [
    hydrated,
    inputType,
    interiorStyle,
    roomCountPref,
    customBrief,
    result,
    activeRoomId,
    uploadedFileName,
    uploadedSourceType,
    uploadedImageDataUrl,
    uploadedPdfPageImages,
    uploadedPdfExtractedText,
  ]);

  async function onFileChange(nextFile: File | null) {
    if (!nextFile) {
      setUploadedFileName("");
      setUploadedImageDataUrl("");
      setUploadedPdfPageImages([]);
      setUploadedPdfExtractedText("");
      setUploadedSourceType("image");
      return;
    }
    const isPdf = nextFile.type === "application/pdf" || nextFile.name.toLowerCase().endsWith(".pdf");
    const isImage = nextFile.type.startsWith("image/");
    if (!isImage && !isPdf) {
      setError("Only image or PDF files are supported.");
      return;
    }
    if (nextFile.size > 12 * 1024 * 1024) {
      setError("Please upload a file under 12MB.");
      return;
    }
    try {
      setUploadedFileName(nextFile.name);
      setUploadedSourceType(isPdf ? "pdf" : "image");
      if (isPdf) {
        const pdfContext = await pdfFileToContext(nextFile);
        setUploadedImageDataUrl("");
        setUploadedPdfPageImages(pdfContext.pageImages);
        setUploadedPdfExtractedText(pdfContext.extractedText);
      } else {
        const dataUrl = await fileToDataUrl(nextFile);
        setUploadedImageDataUrl(dataUrl);
        setUploadedPdfPageImages([]);
        setUploadedPdfExtractedText("");
      }
    } catch {
      setError("Unable to process selected file.");
    }
  }

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (uploadedSourceType === "image" && !uploadedImageDataUrl) {
      setError("Please upload a floorplan or room photo.");
      return;
    }
    if (uploadedSourceType === "pdf" && uploadedPdfPageImages.length === 0) {
      setError("Please upload a floorplan or room photo.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/visualization/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: uploadedImageDataUrl,
          ...(uploadedPdfPageImages.length ? { pdfPageImages: uploadedPdfPageImages } : {}),
          ...(uploadedPdfExtractedText ? { pdfExtractedText: uploadedPdfExtractedText } : {}),
          inputType,
          interiorStyle,
          sourceFileType: uploadedSourceType,
          customBrief: customBrief.trim(),
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
            <h3 className="font-semibold text-[var(--foreground)] mb-3">1) Upload image or PDF</h3>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)]/70 p-4 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] transition-colors">
              <ImagePlus className="h-4 w-4" />
              <span>{uploadedFileName || "Choose floorplan/room photo (PNG/JPG/WEBP) or PDF"}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="mt-1.5 text-xs text-[var(--text-subtle)]">
              PDFs are auto-converted to high-resolution image context before AI analysis.
            </p>
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

          <div>
            <label className="text-sm text-[var(--text-muted)]">
              <span className="block mb-1.5">Additional preferences (optional)</span>
              <textarea
                rows={3}
                maxLength={500}
                className="input w-full"
                placeholder="e.g. keep pooja unit in living, prefer warm lights, avoid dark wood, kid-friendly furniture."
                value={customBrief}
                onChange={(e) => setCustomBrief(e.target.value)}
              />
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
          {hydrated && result ? (
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => {
                setResult(null);
                setActiveRoomId("");
                setUploadedFileName("");
                setUploadedImageDataUrl("");
                setUploadedPdfPageImages([]);
                setUploadedPdfExtractedText("");
                setUploadedSourceType("image");
                setVisualizationSessionState(null);
              }}
            >
              Clear saved visualization
            </button>
          ) : null}
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

