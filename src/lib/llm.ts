import OpenAI from "openai";
import { env } from "@/lib/env";

export type LlmProvider = "OPENAI" | "GEMINI";

type LlmSettingsInput = {
  llmProvider?: string | null;
  llmModel?: string | null;
  llmImageModel?: string | null;
};

export type ResolvedLlmSettings = {
  provider: LlmProvider;
  textModel: string;
  imageModel: string;
};

function normalizeProvider(value: string | null | undefined): LlmProvider {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  return normalized === "GEMINI" ? "GEMINI" : "OPENAI";
}

export function resolveLlmSettings(input: LlmSettingsInput): ResolvedLlmSettings {
  const provider = normalizeProvider(input.llmProvider);
  const textModel =
    input.llmModel?.trim() ||
    (provider === "GEMINI" ? env.geminiModel : env.openaiModel) ||
    "gpt-4o-mini";
  const imageModel = input.llmImageModel?.trim() || env.openaiImageModel || "gpt-image-1";
  return { provider, textModel, imageModel };
}

export function createTextLlmClient(provider: LlmProvider): OpenAI {
  if (provider === "GEMINI") {
    if (!env.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    return new OpenAI({
      apiKey: env.geminiApiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    });
  }
  if (!env.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  return new OpenAI({ apiKey: env.openaiApiKey });
}

export function createOpenAiImageClient(): OpenAI | null {
  if (!env.openaiApiKey) return null;
  return new OpenAI({ apiKey: env.openaiApiKey });
}

