export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminSeedEmail: process.env.ADMIN_SEED_EMAIL ?? "",
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD ?? "",
  adminSeedName: process.env.ADMIN_SEED_NAME ?? "Interior OS Admin",
  sessionCookieName: "io_session",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
  razorpayXAccountNumber: process.env.RAZORPAY_X_ACCOUNT_NUMBER ?? "",
};
