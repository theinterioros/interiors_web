import crypto from "crypto";
import { NotificationType } from "@/lib/types";
import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function notifyUser({
  userId,
  email,
  type,
  title,
  message,
}: {
  userId: string;
  email: string;
  type: NotificationType;
  title: string;
  message: string;
}) {
  await sql`
    insert into notifications (id, user_id, type, title, message)
    values (${crypto.randomUUID()}, ${userId}, ${type}, ${title}, ${message})
  `;

  try {
    await sendEmail(email, title, `<p>${message}</p>`);
  } catch (error) {
    console.error("Email notification failed:", error);
  }
}
