export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminSeedEmail: process.env.ADMIN_SEED_EMAIL ?? "",
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD ?? "",
  adminSeedName: process.env.ADMIN_SEED_NAME ?? "Interior OS Admin",
  sessionCookieName: "io_session",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
};
