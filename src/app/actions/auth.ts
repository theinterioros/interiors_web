"use server";

import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, clearSession } from "@/lib/session";
import { requestOtp, verifyOtp } from "@/lib/otp";

export async function registerAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "CUSTOMER") as Role;
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  if (![Role.CUSTOMER, Role.DESIGNER].includes(role)) {
    return { ok: false, error: "Invalid role selection." };
  }

  if (role === Role.DESIGNER) {
    const city = String(formData.get("city") ?? "").trim();
    const pincode = String(formData.get("pincode") ?? "").trim();
    const about = String(formData.get("about") ?? "").trim();
    if (!city || !pincode || !about) {
      return { ok: false, error: "Designer profile details are required." };
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Email is already registered." };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      name: name || null,
      designerProfile:
        role === Role.DESIGNER
          ? {
              create: {
                name: name || "Designer",
                experienceYears: Number(formData.get("experienceYears") ?? 0),
                city: String(formData.get("city") ?? "").trim(),
                pincode: String(formData.get("pincode") ?? "").trim(),
                about: String(formData.get("about") ?? "").trim(),
              },
            }
          : undefined,
    },
  });

  await createSession(user.id);
  return redirectByRole(user.role);
}

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "Invalid credentials." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Invalid credentials." };
  }

  await createSession(user.id);
  return redirectByRole(user.role);
}

export async function logoutAction() {
  await clearSession();
  return { ok: true };
}

export async function requestOtpAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Email is required." };
  }

  try {
    await requestOtp(email);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send OTP.";
    return { ok: false, error: message };
  }
}

export async function verifyOtpAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !code) {
    return { ok: false, error: "Email and code are required." };
  }

  try {
    const valid = await verifyOtp(email, code);
    if (!valid) {
      return { ok: false, error: "Invalid or expired code." };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify OTP.";
    return { ok: false, error: message };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "No account found for this email." };
  }

  await createSession(user.id);
  return redirectByRole(user.role);
}

function redirectByRole(role: Role) {
  if (role === Role.ADMIN) {
    redirect("/admin/dashboard");
  }
  if (role === Role.DESIGNER) {
    redirect("/designer/dashboard");
  }
  redirect("/customer/dashboard");
}
