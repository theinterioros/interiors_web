export type VisualizationSessionState = {
  inputType: "floorplan" | "room_photo";
  interiorStyle: string;
  roomCountPref: "auto" | "1" | "2" | "3" | "4" | "5" | "6";
  customBrief: string;
  activeRoomId: string;
  result: {
    summary: string;
    detectedImageType: "floorplan" | "room_photo";
    rooms: Array<{
      id: string;
      name: string;
      rationale: string;
      prompt: string;
      renderImageUrl?: string;
    }>;
  } | null;
  uploadedFileName: string;
  sourceFileType: "image" | "pdf";
  uploadedImageDataUrl: string;
  uploadedPdfPageImages: string[];
  uploadedPdfExtractedText: string;
};

let visualizationSessionState: VisualizationSessionState | null = null;

export function getVisualizationSessionState(): VisualizationSessionState | null {
  return visualizationSessionState;
}

export function setVisualizationSessionState(state: VisualizationSessionState | null): void {
  visualizationSessionState = state;
}

