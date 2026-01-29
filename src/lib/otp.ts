import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getAdminSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email";

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

  await prisma.emailOtp.create({
    data: {
      email,
      codeHash,
      expiresAt,
    },
  });

  await sendEmail(
    email,
    "Your Interior OS login code",
    `<p>Your login code is <strong>${code}</strong>. It expires in ${OTP_TTL_MINUTES} minutes.</p>`
  );
}

export async function verifyOtp(email: string, code: string) {
  const settings = await getAdminSettings();
  if (!settings.otpEnabled) {
    throw new Error("OTP login is disabled by admin.");
  }

  const codeHash = hashCode(code);
  const record = await prisma.emailOtp.findFirst({
    where: {
      email,
      codeHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return false;

  await prisma.emailOtp.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return true;
}
