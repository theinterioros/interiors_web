"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role, Roles, RoleValues } from "@/lib/types";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, clearSession } from "@/lib/session";
import { requestOtp, verifyOtp, requestForgotPasswordOtp, verifyOtpForForgotPassword } from "@/lib/otp";
import { hasFirmPaidRegistration } from "@/lib/registrationPayments";
import { FIRM_REGISTRATION_AMOUNT } from "@/lib/registrationPayments";
import { getSessionUser } from "@/lib/session";
import { isValidEmail, isValidIndianMobile, normalizeIndianMobile, validatePortfolioFile } from "@/lib/validation";
import { uploadBlob } from "@/lib/blob";

export type RegisterResult = { error?: string; redirect?: string };

export async function registerAction(_prevState: unknown, formData: FormData): Promise<RegisterResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const role = String(formData.get("role") ?? "CUSTOMER") as Role;
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  if (role === RoleValues.FIRM && !phone) {
    return { error: "Phone is required for firm registration." };
  }
  if (phone && !isValidIndianMobile(phone)) {
    return { error: "Please enter a valid 10-digit Indian mobile number." };
  }
  const phoneForDb = phone ? normalizeIndianMobile(phone) : null;
  if (role === RoleValues.CUSTOMER && !name) {
    return { error: "Name is required." };
  }

  if (!Roles.includes(role)) {
    return { error: "Invalid role selection." };
  }

  if (role === RoleValues.ADMIN) {
    return { error: "Admin signups are not allowed." };
  }

  if (role === RoleValues.FIRM) {
    const city = String(formData.get("city") ?? "").trim();
    const pincode = String(formData.get("pincode") ?? "").trim();
    const about = String(formData.get("about") ?? "").trim();
    const firmName = String(formData.get("firmName") ?? "").trim();
    const ownerName = String(formData.get("ownerName") ?? "").trim();
    const officeAddress = String(formData.get("officeAddress") ?? "").trim();
    const experienceYearsRaw = String(formData.get("experienceYears") ?? "").trim();
    const experienceYears = experienceYearsRaw === "" ? NaN : Number(experienceYearsRaw);
    const altPhone = String(formData.get("altPhone") ?? "").trim();

    const missing: string[] = [];
    if (!city) missing.push("City");
    if (!pincode) missing.push("Pincode");
    if (!about) missing.push("About your firm");
    if (missing.length > 0) {
      return { error: `Please fill in: ${missing.join(", ")}.` };
    }
    if (!/^[0-9]{6}$/.test(pincode)) {
      return { error: "Pincode must be exactly 6 digits." };
    }
    if (Number.isNaN(experienceYears) || experienceYears < 0 || experienceYears > 99) {
      return { error: "Experience (years) is required and must be between 0 and 99." };
    }
    if (about.length < 50) {
      return { error: "About your firm must be at least 50 characters." };
    }
    if (altPhone && !isValidIndianMobile(altPhone)) {
      return { error: "Alternate mobile must be a valid 10-digit Indian number." };
    }

    const missingFirm: string[] = [];
    if (!firmName) missingFirm.push("Firm name");
    if (!ownerName) missingFirm.push("Owner / contact name");
    if (!officeAddress) missingFirm.push("Office address");
    if (missingFirm.length > 0) {
      return { error: `Please fill in: ${missingFirm.join(", ")}.` };
    }
  }

  const [existing] = await sql<{ id: string }>`
    select id from users where email = ${email} limit 1
  `;
  if (existing) {
    return { error: "This email is already registered. Sign in or use a different email." };
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

    const profileId = crypto.randomUUID();
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
        about,
        platform_margin_pct,
        margin_accepted_at
      )
      values (
        ${profileId},
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
        ${String(formData.get("about") ?? "").trim()},
        5,
        now()
      )
    `;

    // Optional portfolio project: one work with up to 5 images (titles max 50 chars)
    const projectTitle = String(formData.get("portfolioProjectTitle") ?? "").trim();
    const projectDescription = String(formData.get("portfolioProjectDescription") ?? "").trim();
    const portfolioImages: { file: File; title: string }[] = [];
    for (let i = 1; i <= 5; i++) {
      const file = formData.get(`portfolioImage${i}`);
      if (file instanceof File && file.size > 0) {
        const titleRaw = String(formData.get(`portfolioImageTitle${i}`) ?? "").trim();
        portfolioImages.push({ file, title: titleRaw.slice(0, 50) || file.name.slice(0, 50) });
      }
    }
    if (portfolioImages.length > 0 && !projectTitle) {
      return { error: "Please enter a project title when adding portfolio images." };
    }
    if (portfolioImages.length > 0 && projectTitle) {
      try {
        const workId = crypto.randomUUID();
        await sql`
          insert into firm_portfolio_works (id, profile_id, title, description, display_order)
          values (${workId}, ${profileId}, ${projectTitle}, ${projectDescription || null}, 0)
        `;
        for (const { file, title } of portfolioImages) {
          const blobUrl = await uploadBlob(file, `firm-portfolio/${profileId}`);
          await sql`
            insert into firm_portfolio_files (id, profile_id, work_id, blob_url, file_name, mime_type, size_bytes)
            values (${crypto.randomUUID()}, ${profileId}, ${workId}, ${blobUrl}, ${title}, ${file.type}, ${file.size})
          `;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes("firm_portfolio_works") && !msg.includes("firm_portfolio_files") && !msg.includes("does not exist")) {
          throw e;
        }
      }
    }
  }

  await createSession(userId);
  if (role === RoleValues.FIRM) {
    return { redirect: "/designer/dashboard" };
  }
  if (role === RoleValues.CUSTOMER) {
    return { redirect: "/customer/dashboard" };
  }
  if (role === RoleValues.ADMIN) {
    return { redirect: "/admin" };
  }
  return { redirect: "/customer/dashboard" };
}

const INTENDED_ROLE_TO_DB: Record<string, Role> = {
  customer: RoleValues.CUSTOMER,
  firm: RoleValues.FIRM,
  designer: RoleValues.FIRM,
  admin: RoleValues.ADMIN,
};

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const intendedRoleRaw = String(formData.get("intendedRole") ?? "").trim().toLowerCase();
  const intendedRole = INTENDED_ROLE_TO_DB[intendedRoleRaw] ?? null;

  if (!email) {
    return { ok: false, error: "Email is required." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const [user] = await sql<{ id: string; password_hash: string; role: Role }>`
    select id, password_hash, role from users where email = ${email} limit 1
  `;
  if (!user) {
    return { ok: false, error: "Invalid credentials." };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { ok: false, error: "Invalid credentials." };
  }

  if (intendedRole != null && user.role !== intendedRole) {
    const roleLabels: Record<Role, string> = {
      [RoleValues.ADMIN]: "Admin",
      [RoleValues.CUSTOMER]: "Customer",
      [RoleValues.FIRM]: "Designer",
    };
    return {
      ok: false,
      error: `This email is registered as ${roleLabels[user.role]}. Please sign in as ${roleLabels[user.role]} to continue.`,
    };
  }

  await createSession(user.id);
  if (user.role === RoleValues.FIRM) {
    const paid = await hasFirmPaidRegistration(user.id);
    if (!paid) {
      redirect("/designer/register/pay");
    }
  }
  if (user.role === RoleValues.CUSTOMER) {
    const { hasCustomerPaidSubscription } = await import("@/lib/registrationPayments");
    const paid = await hasCustomerPaidSubscription(user.id);
    if (!paid) {
      redirect("/customer/subscribe");
    }
  }
  const redirectUrlRaw = String(formData.get("redirect") ?? "").trim();
  const safeRedirect =
    redirectUrlRaw.startsWith("/") && !redirectUrlRaw.startsWith("//") ? redirectUrlRaw : null;
  if (safeRedirect) redirect(safeRedirect);
  return redirectByRole(user.role);
}

export type PayFirmRegistrationResult = { redirect?: string; error?: string };

export async function payFirmRegistrationAction(): Promise<PayFirmRegistrationResult> {
  const user = await getSessionUser();
  if (!user || user.role !== RoleValues.FIRM) {
    return { error: "Unauthorized." };
  }
  const paid = await hasFirmPaidRegistration(user.id);
  if (paid) {
    return { redirect: "/designer/dashboard" };
  }
  const id = crypto.randomUUID();
  await sql`
    insert into payment_ledger (id, type, status, amount, currency, firm_id)
    values (${id}, 'FIRM_REGISTRATION_FEE', 'RELEASED', ${FIRM_REGISTRATION_AMOUNT}, 'INR', ${user.id})
  `;
  try {
    await sql`
      update firm_profiles
      set subscription_expires_at = coalesce(
        case when subscription_expires_at > now() then subscription_expires_at + interval '1 year' else null end,
        now() + interval '1 year'
      )
      where user_id = ${user.id}
    `;
  } catch {
    // subscription_expires_at column may not exist before migration
  }
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/designer/dashboard");
  revalidatePath("/designer/payments");
  revalidatePath("/designer/profile");
  return { redirect: "/designer/dashboard" };
}

/** Renew designer subscription (extends expiry by 1 year). Use when expired or for early renewal. */
export async function renewFirmSubscriptionAction(): Promise<PayFirmRegistrationResult> {
  const user = await getSessionUser();
  if (!user || user.role !== RoleValues.FIRM) {
    return { error: "Unauthorized." };
  }
  const id = crypto.randomUUID();
  await sql`
    insert into payment_ledger (id, type, status, amount, currency, firm_id)
    values (${id}, 'FIRM_REGISTRATION_FEE', 'RELEASED', ${FIRM_REGISTRATION_AMOUNT}, 'INR', ${user.id})
  `;
  try {
    await sql`
      update firm_profiles
      set subscription_expires_at = coalesce(
        case when subscription_expires_at > now() then subscription_expires_at + interval '1 year' else now() + interval '1 year' end,
        now() + interval '1 year'
      )
      where user_id = ${user.id}
    `;
  } catch {
    // column may not exist
  }
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/designer/dashboard");
  revalidatePath("/designer/profile");
  revalidatePath("/designer/payments");
  return { redirect: "/designer/profile" };
}

export type PayCustomerSubscriptionResult = { redirect?: string; error?: string };

export async function payCustomerSubscriptionAction(): Promise<PayCustomerSubscriptionResult> {
  const user = await getSessionUser();
  if (!user || user.role !== RoleValues.CUSTOMER) {
    return { error: "Unauthorized." };
  }
  const { hasCustomerPaidSubscription, CUSTOMER_SUBSCRIPTION_AMOUNT } = await import("@/lib/registrationPayments");
  const paid = await hasCustomerPaidSubscription(user.id);
  if (paid) {
    return { redirect: "/customer/dashboard" };
  }
  const id = crypto.randomUUID();
  await sql`
    insert into payment_ledger (id, type, status, amount, currency, customer_id)
    values (${id}, 'CUSTOMER_REGISTRATION_FEE', 'RELEASED', ${CUSTOMER_SUBSCRIPTION_AMOUNT}, 'INR', ${user.id})
  `;
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/payments");
  return { redirect: "/customer/dashboard" };
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
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/customer/dashboard");
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
  const intendedRoleRaw = String(formData.get("intendedRole") ?? "").trim().toLowerCase();
  const intendedRole = INTENDED_ROLE_TO_DB[intendedRoleRaw] ?? null;

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

  if (intendedRole != null && user.role !== intendedRole) {
    const roleLabels: Record<Role, string> = {
      [RoleValues.ADMIN]: "Admin",
      [RoleValues.CUSTOMER]: "Customer",
      [RoleValues.FIRM]: "Designer",
    };
    return {
      ok: false,
      error: `This email is registered as ${roleLabels[user.role]}. Please sign in as ${roleLabels[user.role]} to continue.`,
    };
  }

  await createSession(user.id);
  if (user.role === RoleValues.FIRM) {
    const paid = await hasFirmPaidRegistration(user.id);
    if (!paid) {
      redirect("/designer/register/pay");
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

function redirectByRole(role: Role) {
  if (role === RoleValues.ADMIN) {
    redirect("/admin");
  }
  if (role === RoleValues.FIRM) {
    redirect("/designer/dashboard");
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

  let role = String(formData.get("role") ?? "customer").toLowerCase();
  if (role === "firm") role = "designer"; // match login persona URL
  redirect(`/login?role=${role}&reset=1`);
}
