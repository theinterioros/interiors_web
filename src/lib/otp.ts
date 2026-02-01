import crypto from "crypto";
import { getAdminSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email";
import { sql } from "@/lib/db";

const OTP_TTL_MINUTES = 10;

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function requestOtp(email: string) {
  const settings = await getAdminSettings();
  if (!settings.otpEnabled) {
    throw new Error("OTP login is disabled by admin.");
  }

  const code = `${crypto.randomInt(100000, 999999)}`;
  const codeHash = hashCode(code);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_TTL_MINUTES);

  await sql`
    insert into email_otps (id, email, code_hash, expires_at)
    values (${crypto.randomUUID()}, ${email}, ${codeHash}, ${expiresAt})
  `;

  await sendEmail(
    email,
    "Your Interior OS login code",
    `<p>Your login code is <strong>${code}</strong>. It expires in ${OTP_TTL_MINUTES} minutes.</p>`
  );
}

/** Forgot password: send OTP only if user exists (does not require otp_enabled). */
export async function requestForgotPasswordOtp(email: string): Promise<boolean> {
  const [user] = await sql<{ id: string }>`select id from users where email = ${email} limit 1`;
  if (!user) return false;

  const code = `${crypto.randomInt(100000, 999999)}`;
  const codeHash = hashCode(code);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_TTL_MINUTES);

  await sql`
    insert into email_otps (id, email, code_hash, expires_at)
    values (${crypto.randomUUID()}, ${email}, ${codeHash}, ${expiresAt})
  `;

  await sendEmail(
    email,
    "Reset your Interior OS password",
    `<p>Your verification code is <strong>${code}</strong>. It expires in ${OTP_TTL_MINUTES} minutes. Use it on the reset password page.</p>`
  );
  return true;
}

export async function verifyOtp(email: string, code: string) {
  const settings = await getAdminSettings();
  if (!settings.otpEnabled) {
    throw new Error("OTP login is disabled by admin.");
  }

  const codeHash = hashCode(code);
  const [record] = await sql<{ id: string }>`
    select id
    from email_otps
    where email = ${email}
      and code_hash = ${codeHash}
      and used_at is null
      and expires_at > now()
    order by created_at desc
    limit 1
  `;

  if (!record) return false;

  await sql`update email_otps set used_at = now() where id = ${record.id}`;

  return true;
}

/** Verify OTP without checking otp_enabled (for forgot password). */
export async function verifyOtpForForgotPassword(email: string, code: string): Promise<boolean> {
  const codeHash = hashCode(code);
  const [record] = await sql<{ id: string }>`
    select id
    from email_otps
    where email = ${email}
      and code_hash = ${codeHash}
      and used_at is null
      and expires_at > now()
    order by created_at desc
    limit 1
  `;

  if (!record) return false;

  await sql`update email_otps set used_at = now() where id = ${record.id}`;

  return true;
}
