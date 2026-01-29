"use server";

import { Role, DesignerStatus, PaymentStatus } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) {
    return null;
  }
  return user;
}

export async function updateSettingsAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const settings = await prisma.adminSettings.findFirst();
  const otpEnabled = formData.get("otpEnabled") === "on";

  const payload = {
    otpEnabled,
    customerRegistrationFee: Number(formData.get("customerRegistrationFee") ?? 0),
    designerYearlyFee: Number(formData.get("designerYearlyFee") ?? 0),
    digitalTwinYearlyFee: Number(formData.get("digitalTwinYearlyFee") ?? 1000),
    smtpHost: String(formData.get("smtpHost") ?? "") || null,
    smtpPort: formData.get("smtpPort") ? Number(formData.get("smtpPort")) : null,
    smtpUser: String(formData.get("smtpUser") ?? "") || null,
    smtpPass: String(formData.get("smtpPass") ?? "") || null,
    smtpSecure: formData.get("smtpSecure") === "on",
  };

  if (settings) {
    await prisma.adminSettings.update({ where: { id: settings.id }, data: payload });
  } else {
    await prisma.adminSettings.create({ data: payload });
  }

  return { ok: true };
}

export async function addRateAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const settings = await prisma.adminSettings.findFirst();
  if (!settings) return { ok: false, error: "Settings not initialized." };

  const city = String(formData.get("city") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const ratePerSqFt = Number(formData.get("ratePerSqFt") ?? 0);

  if (!city || !pincode || !ratePerSqFt) {
    return { ok: false, error: "All fields are required." };
  }

  await prisma.cityPincodeRate.create({
    data: {
      settingsId: settings.id,
      city,
      pincode,
      ratePerSqFt,
    },
  });

  return { ok: true };
}

export async function toggleRateAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const rateId = String(formData.get("rateId") ?? "");
  const isActive = formData.get("isActive") === "true";

  await prisma.cityPincodeRate.update({
    where: { id: rateId },
    data: { isActive },
  });

  return { ok: true };
}

export async function addSocialLinkAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const settings = await prisma.adminSettings.findFirst();
  if (!settings) return { ok: false, error: "Settings not initialized." };

  const platform = String(formData.get("platform") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!platform || !url) {
    return { ok: false, error: "Platform and URL are required." };
  }

  await prisma.socialLink.create({
    data: {
      settingsId: settings.id,
      platform,
      url,
      showInHeader: formData.get("showInHeader") === "on",
      showInFooter: formData.get("showInFooter") === "on",
      showInLanding: formData.get("showInLanding") === "on",
    },
  });

  return { ok: true };
}

export async function addMarketingLinkAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const settings = await prisma.adminSettings.findFirst();
  if (!settings) return { ok: false, error: "Settings not initialized." };

  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!label || !url) {
    return { ok: false, error: "Label and URL are required." };
  }

  await prisma.marketingLink.create({
    data: {
      settingsId: settings.id,
      label,
      url,
      showInHeader: formData.get("showInHeader") === "on",
      showInFooter: formData.get("showInFooter") === "on",
      showInLanding: formData.get("showInLanding") === "on",
    },
  });

  return { ok: true };
}

export async function deleteLinkAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const linkId = String(formData.get("linkId") ?? "");
  const type = String(formData.get("type") ?? "");

  if (type === "social") {
    await prisma.socialLink.delete({ where: { id: linkId } });
  }
  if (type === "marketing") {
    await prisma.marketingLink.delete({ where: { id: linkId } });
  }

  return { ok: true };
}

export async function approveDesignerAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const profileId = String(formData.get("profileId") ?? "");
  const profile = await prisma.designerProfile.update({
    where: { id: profileId },
    data: { status: DesignerStatus.APPROVED },
    include: { user: true },
  });

  await notifyUser({
    userId: profile.userId,
    email: profile.user.email,
    type: "DESIGNER_APPROVED",
    title: "Designer profile approved",
    message: "Your designer profile has been approved and is now publicly visible.",
  });

  return { ok: true };
}

export async function rejectDesignerAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const profileId = String(formData.get("profileId") ?? "");
  await prisma.designerProfile.update({
    where: { id: profileId },
    data: { status: DesignerStatus.REJECTED },
  });

  return { ok: true };
}

export async function holdPaymentAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const paymentId = String(formData.get("paymentId") ?? "");
  await prisma.paymentLedger.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.HELD },
  });

  return { ok: true };
}

export async function releasePaymentAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized." };

  const paymentId = String(formData.get("paymentId") ?? "");
  const payment = await prisma.paymentLedger.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.RELEASED },
    include: { customer: true, designer: true },
  });

  if (payment.customer) {
    await notifyUser({
      userId: payment.customer.id,
      email: payment.customer.email,
      type: "PAYMENT_RELEASED",
      title: "Payment released",
      message: `Payment of ₹${payment.amount} has been released.`,
    });
  }

  if (payment.designer) {
    await notifyUser({
      userId: payment.designer.id,
      email: payment.designer.email,
      type: "PAYMENT_RELEASED",
      title: "Payment released",
      message: `Payment of ₹${payment.amount} has been released.`,
    });
  }

  return { ok: true };
}
