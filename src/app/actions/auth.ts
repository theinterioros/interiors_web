"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { Role, Roles, RoleValues } from "@/lib/types";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, clearSession } from "@/lib/session";
import { requestOtp, verifyOtp } from "@/lib/otp";

export async function registerAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "CUSTOMER") as Role;
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password || !phone) {
    return { ok: false, error: "Name, email, phone, and password are required." };
  }

  if (!Roles.includes(role)) {
    return { ok: false, error: "Invalid role selection." };
  }

  if (role === RoleValues.ADMIN) {
    return { ok: false, error: "Admin signups are not allowed." };
  }

  if (role === RoleValues.FIRM) {
    const city = String(formData.get("city") ?? "").trim();
    const pincode = String(formData.get("pincode") ?? "").trim();
    const about = String(formData.get("about") ?? "").trim();
    const firmName = String(formData.get("firmName") ?? "").trim();
    const ownerName = String(formData.get("ownerName") ?? "").trim();
    const officeAddress = String(formData.get("officeAddress") ?? "").trim();
    if (!city || !pincode || !about) {
      return { ok: false, error: "Firm profile details are required." };
    }
    if (!firmName || !ownerName || !officeAddress) {
      return { ok: false, error: "Firm details are required." };
    }
  }

  const [existing] = await sql<{ id: string }>`
    select id from users where email = ${email} or phone = ${phone} limit 1
  `;
  if (existing) {
    return { ok: false, error: "Email is already registered." };
  }

  const passwordHash = await hashPassword(password);

  const userId = crypto.randomUUID();
  await sql`
    insert into users (id, email, phone, password_hash, role, name)
    values (${userId}, ${email}, ${phone}, ${passwordHash}, ${role}, ${name || null})
  `;

  if (role === RoleValues.FIRM) {
    const firmName = String(formData.get("firmName") ?? "").trim();
    const ownerName = String(formData.get("ownerName") ?? "").trim();
    const officeAddress = String(formData.get("officeAddress") ?? "").trim();
    const gst = String(formData.get("gst") ?? "").trim();
    const businessType = String(formData.get("businessType") ?? "").trim();
    const ticketSize = String(formData.get("ticketSize") ?? "").trim();
    const designersCount = Number(formData.get("designersCount") ?? 0) || null;
    const comments = String(formData.get("comments") ?? "").trim();

    await sql`
      insert into firm_profiles (
        id,
        user_id,
        firm_name,
        owner_name,
        office_address,
        gst,
        business_type,
        ticket_size,
        designers_count,
        comments,
        name,
        experience_years,
        city,
        pincode,
        about
      )
      values (
        ${crypto.randomUUID()},
        ${userId},
        ${firmName || null},
        ${ownerName || null},
        ${officeAddress || null},
        ${gst || null},
        ${businessType || null},
        ${ticketSize || null},
        ${designersCount},
        ${comments || null},
        ${name || "Firm Owner"},
        ${Number(formData.get("experienceYears") ?? 0)},
        ${String(formData.get("city") ?? "").trim()},
        ${String(formData.get("pincode") ?? "").trim()},
        ${String(formData.get("about") ?? "").trim()}
      )
    `;
  }

  await createSession(userId);
  return redirectByRole(role);
}

export async function loginAction(_prevState: unknown, formData: FormData) {
  const identifier = String(formData.get("identifier") ?? formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const [user] = await sql<{
    id: string;
    password_hash: string;
    role: Role;
  }>`
    select id, password_hash, role
    from users
    where email = ${identifier} or phone = ${identifier}
    limit 1
  `;
  if (!user) {
    return { ok: false, error: "Invalid credentials." };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { ok: false, error: "Invalid credentials." };
  }

  await createSession(user.id);
  return redirectByRole(user.role);
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
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

  const [user] = await sql<{ id: string; role: Role }>`
    select id, role from users where email = ${email} limit 1
  `;
  if (!user) {
    return { ok: false, error: "No account found for this email." };
  }

  await createSession(user.id);
  return redirectByRole(user.role);
}

function redirectByRole(role: Role) {
  if (role === RoleValues.ADMIN) {
    redirect("/admin/dashboard");
  }
  if (role === RoleValues.FIRM) {
    redirect("/firm/dashboard");
  }
  redirect("/customer/dashboard");
}
