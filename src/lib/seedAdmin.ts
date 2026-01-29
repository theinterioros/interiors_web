import crypto from "crypto";
import { env } from "@/lib/env";
import { hashPassword } from "@/lib/password";
import { sql } from "@/lib/db";

export async function ensureAdminSeed() {
  if (!env.adminSeedEmail || !env.adminSeedPassword) {
    return;
  }

  let existingAdmin: { id: string } | undefined;
  try {
    [existingAdmin] = await sql<{ id: string }>`
      select id from users where role = 'ADMIN' limit 1
    `;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // If schema isn't applied yet, skip seeding to avoid crashing dev server.
    if (message.includes('relation "users" does not exist')) {
      console.warn("Skipping admin seed: database schema not applied.");
      return;
    }
    throw error;
  }

  if (existingAdmin) return;

  const passwordHash = await hashPassword(env.adminSeedPassword);

  await sql`
    insert into users (id, email, password_hash, role, name)
    values (
      ${crypto.randomUUID()},
      ${env.adminSeedEmail},
      ${passwordHash},
      'ADMIN',
      ${env.adminSeedName}
    )
  `;
}
