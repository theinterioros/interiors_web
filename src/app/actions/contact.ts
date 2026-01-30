"use server";

import { getAdminSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email";
import { isValidEmail, isValidIndianMobile } from "@/lib/validation";

export type ContactState = { ok: boolean; error: string };

export async function contactAction(_prevState: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !phone) {
    return { ok: false, error: "Name, email, and phone are required." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!isValidIndianMobile(phone)) {
    return { ok: false, error: "Please enter a valid 10-digit Indian mobile number." };
  }

  const settings = await getAdminSettings();
  if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPass) {
    return {
      ok: false,
      error: "Contact form is not configured yet. Please email us at hello@interioros.com.",
    };
  }

  const to = settings.smtpUser;
  const subject = `[Interior OS] Request a call from ${name}`;
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message) || "(none)"}</p>
  `;

  try {
    await sendEmail(to, subject, html);
    return { ok: true, error: "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send. Please try again or email hello@interioros.com.";
    return { ok: false, error: message };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
