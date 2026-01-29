"use server";

import { Role, PaymentStatus, PaymentType, SubscriptionStatus } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBlob } from "@/lib/blob";
import { getAdminSettings } from "@/lib/settings";

export async function uploadDigitalTwinFileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.CUSTOMER) {
    return { ok: false, error: "Unauthorized." };
  }

  const file = formData.get("file");
  const category = String(formData.get("category") ?? "OTHER");
  if (!(file instanceof File)) {
    return { ok: false, error: "File is required." };
  }

  const subscription = await prisma.digitalTwinSubscription.findUnique({
    where: { customerId: user.id },
  });

  if (!subscription) {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await prisma.digitalTwinSubscription.create({
      data: {
        customerId: user.id,
        status: SubscriptionStatus.ACTIVE,
        startedAt: new Date(),
        expiresAt,
      },
    });
  } else if (subscription.expiresAt < new Date()) {
    const settings = await getAdminSettings();
    await prisma.paymentLedger.create({
      data: {
        type: PaymentType.DIGITAL_TWIN_RENEWAL,
        status: PaymentStatus.HELD,
        amount: settings.digitalTwinYearlyFee,
        customerId: user.id,
      },
    });

    const newExpiry = new Date();
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    await prisma.digitalTwinSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: newExpiry,
        lastChargedAt: new Date(),
      },
    });
  }

  const blobUrl = await uploadBlob(file, `digital-twin/${user.id}`);
  const safeCategory = ["WIRING", "PLUMBING", "FLOOR_PLAN", "HANDOVER", "OTHER"].includes(
    category
  )
    ? category
    : "OTHER";

  await prisma.digitalTwinFile.create({
    data: {
      customerId: user.id,
      category: safeCategory as any,
      blobUrl,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      uploadedBy: user.id,
    },
  });

  return { ok: true };
}
