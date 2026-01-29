import nodemailer from "nodemailer";
import { getAdminSettings } from "@/lib/settings";

export async function sendEmail(to: string, subject: string, html: string) {
  const settings = await getAdminSettings();
  if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPass) {
    throw new Error("SMTP settings are not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure ?? false,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
  });

  await transporter.sendMail({
    from: settings.smtpUser,
    to,
    subject,
    html,
  });
}
