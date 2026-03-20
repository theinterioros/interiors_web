import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

function readEnvFile(): Record<string, string> {
  const candidates = [".env.local", ".env"];
  for (const file of candidates) {
    try {
      const full = path.join(process.cwd(), file);
      if (!fs.existsSync(full)) continue;
      const parsed = dotenv.parse(fs.readFileSync(full, "utf8"));
      return parsed as Record<string, string>;
    } catch {
      // ignore
    }
  }
  return {};
}

const fileEnv = readEnvFile();

function envValue(key: string): string {
  const fromProcess = process.env[key];
  const fromFile = fileEnv[key];
  const trimmedProcess = fromProcess?.trim();
  if (trimmedProcess) return trimmedProcess;
  const trimmedFile = fromFile?.trim();
  return trimmedFile ?? "";
}

export const env = {
  databaseUrl: envValue("DATABASE_URL"),
  adminSeedEmail: envValue("ADMIN_SEED_EMAIL"),
  adminSeedPassword: envValue("ADMIN_SEED_PASSWORD"),
  adminSeedName: envValue("ADMIN_SEED_NAME") || "Interior OS Admin",
  sessionCookieName: "io_session",
  appUrl: envValue("APP_URL") || "http://localhost:3000",
  openaiApiKey: envValue("OPENAI_API_KEY"),
  openaiModel: envValue("OPENAI_MODEL") || "gpt-4o-mini",
  razorpayKeyId: envValue("RAZORPAY_KEY_ID"),
  razorpayKeySecret: envValue("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: envValue("RAZORPAY_WEBHOOK_SECRET"),
  razorpayXAccountNumber: envValue("RAZORPAY_X_ACCOUNT_NUMBER"),
};
