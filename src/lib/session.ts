import crypto from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { sql } from "@/lib/db";
import { Role } from "@/lib/types";

const SESSION_TTL_DAYS = 30;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  await sql`
    insert into sessions (id, user_id, token_hash, expires_at)
    values (${crypto.randomUUID()}, ${userId}, ${tokenHash}, ${expiresAt})
  `;

  const cookieStore = await cookies();
  cookieStore.set(env.sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.sessionCookieName)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await sql`delete from sessions where token_hash = ${tokenHash}`;
  }

  cookieStore.delete(env.sessionCookieName);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.sessionCookieName)?.value;
  if (!token) return null;
  const tokenHash = hashToken(token);
  const [row] = await sql<{
    user_id: string;
    expires_at: Date;
    id: string;
    email: string;
    password_hash: string;
    role: Role;
    name: string | null;
    created_at: Date;
    updated_at: Date;
  }>`
    select s.user_id, s.expires_at, u.*
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${tokenHash}
    limit 1
  `;

  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    await sql`delete from sessions where token_hash = ${tokenHash}`;
    cookieStore.delete(env.sessionCookieName);
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
