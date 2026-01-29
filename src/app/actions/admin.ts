"use server";

import crypto from "crypto";
import { RoleValues, DesignerStatusValues, PaymentStatusValues } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { notifyUser } from "@/lib/notifications";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.ADMIN) {
    return null;
  }
  return user;
}

export async function updateSettingsAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  let [settings] = await sql<{ id: string }>`select id from admin_settings limit 1`;
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

  if (!settings) {
    const id = crypto.randomUUID();
    await sql`insert into admin_settings (id) values (${id})`;
    settings = { id };
  }

  await sql`
    update admin_settings
    set otp_enabled = ${payload.otpEnabled},
        customer_registration_fee = ${payload.customerRegistrationFee},
        firm_yearly_fee = ${payload.designerYearlyFee},
        digital_twin_yearly_fee = ${payload.digitalTwinYearlyFee},
        smtp_host = ${payload.smtpHost},
        smtp_port = ${payload.smtpPort},
        smtp_user = ${payload.smtpUser},
        smtp_pass = ${payload.smtpPass},
        smtp_secure = ${payload.smtpSecure},
        updated_at = now()
    where id = ${settings.id}
  `;

  return;
}

export async function addRateAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  const [settings] = await sql<{ id: string }>`select id from admin_settings limit 1`;
  if (!settings) {
    throw new Error("Settings not initialized.");
  }

  const city = String(formData.get("city") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const ratePerSqFt = Number(formData.get("ratePerSqFt") ?? 0);

  if (!city || !pincode || !ratePerSqFt) {
    throw new Error("All fields are required.");
  }

  await sql`
    insert into city_pincode_rates (id, settings_id, city, pincode, rate_per_sq_ft)
    values (${crypto.randomUUID()}, ${settings.id}, ${city}, ${pincode}, ${ratePerSqFt})
  `;

  return;
}

export async function toggleRateAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  const rateId = String(formData.get("rateId") ?? "");
  const isActive = formData.get("isActive") === "true";

  await sql`update city_pincode_rates set is_active = ${isActive} where id = ${rateId}`;

  return;
}

export async function addSocialLinkAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  const [settings] = await sql<{ id: string }>`select id from admin_settings limit 1`;
  if (!settings) {
    throw new Error("Settings not initialized.");
  }

  const platform = String(formData.get("platform") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!platform || !url) {
    throw new Error("Platform and URL are required.");
  }

  await sql`
    insert into social_links (
      id, settings_id, platform, url, show_in_header, show_in_footer, show_in_landing
    )
    values (
      ${crypto.randomUUID()},
      ${settings.id},
      ${platform},
      ${url},
      ${formData.get("showInHeader") === "on"},
      ${formData.get("showInFooter") === "on"},
      ${formData.get("showInLanding") === "on"}
    )
  `;

  return;
}

export async function addMarketingLinkAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  const [settings] = await sql<{ id: string }>`select id from admin_settings limit 1`;
  if (!settings) {
    throw new Error("Settings not initialized.");
  }

  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!label || !url) {
    throw new Error("Label and URL are required.");
  }

  await sql`
    insert into marketing_links (
      id, settings_id, label, url, show_in_header, show_in_footer, show_in_landing
    )
    values (
      ${crypto.randomUUID()},
      ${settings.id},
      ${label},
      ${url},
      ${formData.get("showInHeader") === "on"},
      ${formData.get("showInFooter") === "on"},
      ${formData.get("showInLanding") === "on"}
    )
  `;

  return;
}

export async function deleteLinkAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  const linkId = String(formData.get("linkId") ?? "");
  const type = String(formData.get("type") ?? "");

  if (type === "social") {
    await sql`delete from social_links where id = ${linkId}`;
  }
  if (type === "marketing") {
    await sql`delete from marketing_links where id = ${linkId}`;
  }

  return;
}

export async function approveFirmAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  const profileId = String(formData.get("profileId") ?? "");
  await sql`
    update firm_profiles
    set status = ${DesignerStatusValues.APPROVED}, updated_at = now()
    where id = ${profileId}
  `;

  const [profileUser] = await sql<{ user_id: string; email: string }>`
    select fp.user_id, u.email
    from firm_profiles fp
    join users u on u.id = fp.user_id
    where fp.id = ${profileId}
    limit 1
  `;

  if (profileUser) {
    await notifyUser({
      userId: profileUser.user_id,
      email: profileUser.email,
      type: "FIRM_APPROVED",
      title: "Firm profile approved",
      message: "Your firm profile has been approved and is now publicly visible.",
    });
  }

  return;
}

export async function rejectFirmAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  const profileId = String(formData.get("profileId") ?? "");
  await sql`
    update firm_profiles
    set status = ${DesignerStatusValues.REJECTED}, updated_at = now()
    where id = ${profileId}
  `;

  return;
}

export async function holdPaymentAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  const paymentId = String(formData.get("paymentId") ?? "");
  await sql`
    update payment_ledger
    set status = ${PaymentStatusValues.HELD}, updated_at = now()
    where id = ${paymentId}
  `;

  return;
}

export async function releasePaymentAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized.");
  }

  const paymentId = String(formData.get("paymentId") ?? "");
  await sql`
    update payment_ledger
    set status = ${PaymentStatusValues.RELEASED}, updated_at = now()
    where id = ${paymentId}
  `;

  const [payment] = await sql<{
    amount: number;
    customer_id: string | null;
    firm_id: string | null;
    customer_email: string | null;
    firm_email: string | null;
  }>`
    select p.amount,
           p.customer_id,
           p.firm_id,
           cu.email as customer_email,
           fu.email as firm_email
    from payment_ledger p
    left join users cu on cu.id = p.customer_id
    left join users fu on fu.id = p.firm_id
    where p.id = ${paymentId}
    limit 1
  `;

  if (payment?.customer_id && payment.customer_email) {
    await notifyUser({
      userId: payment.customer_id,
      email: payment.customer_email,
      type: "PAYMENT_RELEASED",
      title: "Payment released",
      message: `Payment of ₹${payment.amount} has been released.`,
    });
  }

  if (payment?.firm_id && payment.firm_email) {
    await notifyUser({
      userId: payment.firm_id,
      email: payment.firm_email,
      type: "PAYMENT_RELEASED",
      title: "Payment released",
      message: `Payment of ₹${payment.amount} has been released.`,
    });
  }

  return;
}
