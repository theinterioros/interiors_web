"use server";

import crypto from "crypto";
import { getAdminSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email";
import { isValidEmail, isValidIndianMobile } from "@/lib/validation";
import { sql } from "@/lib/db";

export type ContactState = { ok: boolean; error: string };

export async function contactAction(_prevState: ContactState, formData: FormData): Promise<ContactState> {
  const firstName = String(formData.get("firstName") ?? formData.get("name") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const name = [firstName, lastName].filter(Boolean).join(" ") || String(formData.get("name") ?? "").trim();
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

  // Save as lead for admin (always)
  try {
    const id = crypto.randomUUID();
    await sql`
      insert into contact_leads (id, name, email, phone, message)
      values (${id}, ${name}, ${email}, ${phone}, ${message || null})
    `;
  } catch (err) {
    console.error("Contact lead insert failed:", err);
    return { ok: false, error: "Unable to submit. Please try again." };
  }

  // Optional: send email to admin if SMTP configured
  const settings = await getAdminSettings();
  if (settings.smtpHost && settings.smtpPort && settings.smtpUser && settings.smtpPass) {
    const to = settings.smtpUser;
    const subject = `[Interior OS] New lead: ${name}`;
    const html = `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message) || "(none)"}</p>
    `;
    try {
      await sendEmail(to, subject, html);
    } catch {
      // Lead already saved; email failure is non-blocking
    }
  }

  return { ok: true, error: "" };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
