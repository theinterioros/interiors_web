"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { Role, Roles, RoleValues } from "@/lib/types";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, clearSession } from "@/lib/session";
import { requestOtp, verifyOtp, requestForgotPasswordOtp, verifyOtpForForgotPassword } from "@/lib/otp";
import { hasFirmPaidRegistration } from "@/lib/registrationPayments";
import { FIRM_REGISTRATION_AMOUNT } from "@/lib/registrationPayments";
import { getSessionUser } from "@/lib/session";
import { isValidEmail, isValidIndianMobile, isEmailLike, normalizeIndianMobile } from "@/lib/validation";

export async function registerAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const role = String(formData.get("role") ?? "CUSTOMER") as Role;
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }
  if (role === RoleValues.FIRM && !phone) {
    return { ok: false, error: "Phone is required for firm registration." };
  }
  if (phone && !isValidIndianMobile(phone)) {
    return { ok: false, error: "Please enter a valid 10-digit Indian mobile number." };
  }
  const phoneForDb = phone ? normalizeIndianMobile(phone) : null;
  if (role === RoleValues.CUSTOMER && !name) {
    return { ok: false, error: "Name is required." };
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
    select id from users where email = ${email} or (${phoneForDb} is not null and phone = ${phoneForDb}) limit 1
  `;
  if (existing) {
    return { ok: false, error: "Email or phone is already registered." };
  }

  const passwordHash = await hashPassword(password);

  const userId = crypto.randomUUID();
  await sql`
    insert into users (id, email, phone, password_hash, role, name)
    values (${userId}, ${email}, ${phoneForDb}, ${passwordHash}, ${role}, ${name || null})
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
  if (role === RoleValues.FIRM) {
    redirect("/firm/register/pay");
  }
  if (role === RoleValues.CUSTOMER) {
    redirect("/customer/dashboard");
  }
  return redirectByRole(role);
}

export async function loginAction(_prevState: unknown, formData: FormData) {
  const identifier = String(formData.get("identifier") ?? formData.get("email") ?? "").trim();
  const identifierLower = identifier.toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!identifier) {
    return { ok: false, error: "Email or mobile number is required." };
  }
  if (isEmailLike(identifier)) {
    if (!isValidEmail(identifier)) {
      return { ok: false, error: "Please enter a valid email address." };
    }
  } else {
    if (!isValidIndianMobile(identifier)) {
      return { ok: false, error: "Please enter a valid 10-digit Indian mobile number." };
    }
  }

  const lookupEmail = isEmailLike(identifier) ? identifierLower : null;
  const lookupPhone = !isEmailLike(identifier) ? normalizeIndianMobile(identifier) : null;
  const [user] = lookupEmail
    ? await sql<{ id: string; password_hash: string; role: Role }>`
        select id, password_hash, role from users where email = ${lookupEmail} limit 1
      `
    : await sql<{ id: string; password_hash: string; role: Role }>`
        select id, password_hash, role from users where phone = ${lookupPhone} limit 1
      `;
  if (!user) {
    return { ok: false, error: "Invalid credentials." };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { ok: false, error: "Invalid credentials." };
  }

  await createSession(user.id);
  if (user.role === RoleValues.FIRM) {
    const paid = await hasFirmPaidRegistration(user.id);
    if (!paid) {
      redirect("/firm/register/pay");
    }
  }
  if (user.role === RoleValues.CUSTOMER) {
    const { hasCustomerPaidSubscription } = await import("@/lib/registrationPayments");
    const paid = await hasCustomerPaidSubscription(user.id);
    if (!paid) {
      redirect("/customer/subscribe");
    }
  }
  return redirectByRole(user.role);
}

export async function payFirmRegistrationAction() {
  const user = await getSessionUser();
  if (!user || user.role !== RoleValues.FIRM) {
    redirect("/login?role=firm");
  }
  const paid = await hasFirmPaidRegistration(user.id);
  if (paid) {
    redirect("/firm/dashboard");
  }
  const id = crypto.randomUUID();
  await sql`
    insert into payment_ledger (id, type, status, amount, currency, firm_id)
    values (${id}, 'FIRM_REGISTRATION_FEE', 'RELEASED', ${FIRM_REGISTRATION_AMOUNT}, 'INR', ${user.id})
  `;
  redirect("/firm/dashboard");
}

export async function payCustomerSubscriptionAction() {
  const user = await getSessionUser();
  if (!user || user.role !== RoleValues.CUSTOMER) {
    redirect("/login?role=customer");
  }
  const { hasCustomerPaidSubscription, CUSTOMER_SUBSCRIPTION_AMOUNT } = await import("@/lib/registrationPayments");
  const paid = await hasCustomerPaidSubscription(user.id);
  if (paid) {
    redirect("/customer/dashboard");
  }
  const id = crypto.randomUUID();
  await sql`
    insert into payment_ledger (id, type, status, amount, currency, customer_id)
    values (${id}, 'CUSTOMER_REGISTRATION_FEE', 'RELEASED', ${CUSTOMER_SUBSCRIPTION_AMOUNT}, 'INR', ${user.id})
  `;
  redirect("/customer/dashboard");
}

/** Pay additional project fee (₹1000) to unlock one more project slot. No redirect. */
export async function payAdditionalProjectFeeAction(): Promise<void> {
  const user = await getSessionUser();
  if (!user || user.role !== RoleValues.CUSTOMER) {
    throw new Error("Unauthorized.");
  }
  const { ADDITIONAL_PROJECT_FEE_AMOUNT } = await import("@/lib/registrationPayments");
  const id = crypto.randomUUID();
  await sql`
    insert into payment_ledger (id, type, status, amount, currency, customer_id)
    values (${id}, 'ADDITIONAL_PROJECT_FEE', 'RELEASED', ${ADDITIONAL_PROJECT_FEE_AMOUNT}, 'INR', ${user.id})
  `;
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
  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
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
  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
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
    redirect("/admin");
  }
  if (role === RoleValues.FIRM) {
    redirect("/firm/dashboard");
  }
  redirect("/customer/dashboard");
}

export async function requestForgotPasswordOtpAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Email is required.", sent: false };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address.", sent: false };
  }
  try {
    const sent = await requestForgotPasswordOtp(email);
    return { ok: true, error: "", sent, email };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to send code. Check SMTP settings.";
    return { ok: false, error: message, sent: false };
  }
}

export async function verifyOtpAndResetPasswordAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !code) {
    return { ok: false, error: "Email and code are required." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }

  const valid = await verifyOtpForForgotPassword(email, code);
  if (!valid) {
    return { ok: false, error: "Invalid or expired code." };
  }

  const [user] = await sql<{ id: string }>`select id from users where email = ${email} limit 1`;
  if (!user) {
    return { ok: false, error: "Account not found." };
  }

  const passwordHash = await hashPassword(newPassword);
  await sql`update users set password_hash = ${passwordHash}, updated_at = now() where id = ${user.id}`;

  const role = String(formData.get("role") ?? "customer");
  redirect(`/login?role=${role}&reset=1`);
}
