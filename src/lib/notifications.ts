import { NotificationType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
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
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
    },
  });

  try {
    await sendEmail(email, title, `<p>${message}</p>`);
  } catch (error) {
    console.error("Email notification failed:", error);
  }
}
