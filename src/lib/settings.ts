import crypto from "crypto";
import { sql } from "@/lib/db";

type AdminSettingsRow = {
  id: string;
  otp_enabled: boolean;
  customer_registration_fee: number;
  firm_yearly_fee: number;
  digital_twin_yearly_fee: number;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  smtp_secure: boolean;
  created_at: Date;
  updated_at: Date;
};

export async function getAdminSettings() {
  let settings: AdminSettingsRow | undefined;
  try {
    [settings] = await sql<AdminSettingsRow>`select * from admin_settings limit 1`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes('relation "admin_settings" does not exist')) {
      console.warn("Admin settings table missing. Apply schema to enable settings.");
      return {
        id: "missing",
        otpEnabled: false,
        customerRegistrationFee: 0,
        designerYearlyFee: 0,
        digitalTwinYearlyFee: 1000,
        smtpHost: null,
        smtpPort: null,
        smtpUser: null,
        smtpPass: null,
        smtpSecure: false,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        socialLinks: [],
        marketingLinks: [],
        rates: [],
      };
    }
    throw error;
  }

  if (!settings) {
    const id = crypto.randomUUID();
    await sql`
      insert into admin_settings (id)
      values (${id})
    `;
    [settings] = await sql<AdminSettingsRow>`select * from admin_settings where id = ${id}`;
  }

  const socialLinks = await sql<{
    id: string;
    settings_id: string;
    platform: string;
    url: string;
    show_in_header: boolean;
    show_in_footer: boolean;
    show_in_landing: boolean;
  }>`select * from social_links where settings_id = ${settings.id} order by platform asc`;

  const marketingLinks = await sql<{
    id: string;
    settings_id: string;
    label: string;
    url: string;
    show_in_header: boolean;
    show_in_footer: boolean;
    show_in_landing: boolean;
  }>`select * from marketing_links where settings_id = ${settings.id} order by label asc`;

  const rates = await sql<{
    id: string;
    settings_id: string;
    city: string;
    pincode: string;
    rate_per_sq_ft: number;
    is_active: boolean;
  }>`select * from city_pincode_rates where settings_id = ${settings.id} order by created_at desc`;

  return {
    id: settings.id,
    otpEnabled: settings.otp_enabled,
    customerRegistrationFee: settings.customer_registration_fee,
    designerYearlyFee: settings.firm_yearly_fee,
    digitalTwinYearlyFee: settings.digital_twin_yearly_fee,
    smtpHost: settings.smtp_host,
    smtpPort: settings.smtp_port,
    smtpUser: settings.smtp_user,
    smtpPass: settings.smtp_pass,
    smtpSecure: settings.smtp_secure,
    createdAt: settings.created_at,
    updatedAt: settings.updated_at,
    socialLinks: socialLinks.map((link) => ({
      id: link.id,
      settingsId: link.settings_id,
      platform: link.platform,
      url: link.url,
      showInHeader: link.show_in_header,
      showInFooter: link.show_in_footer,
      showInLanding: link.show_in_landing,
    })),
    marketingLinks: marketingLinks.map((link) => ({
      id: link.id,
      settingsId: link.settings_id,
      label: link.label,
      url: link.url,
      showInHeader: link.show_in_header,
      showInFooter: link.show_in_footer,
      showInLanding: link.show_in_landing,
    })),
    rates: rates.map((rate) => ({
      id: rate.id,
      settingsId: rate.settings_id,
      city: rate.city,
      pincode: rate.pincode,
      ratePerSqFt: rate.rate_per_sq_ft,
      isActive: rate.is_active,
    })),
  };
}
