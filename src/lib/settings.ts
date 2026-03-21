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
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_address?: string | null;
  estimator_prompt_custom?: string | null;
  visualization_prompt_custom?: string | null;
  created_at: Date;
  updated_at: Date;
};

type AiPromptAuditLogRow = {
  id: string;
  prompt_key: string;
  action: string;
  previous_value: string | null;
  new_value: string | null;
  created_at: Date;
  admin_name: string | null;
  admin_email: string | null;
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
        contactEmail: null,
        contactPhone: null,
        contactAddress: null,
        estimatorPromptCustom: null,
        visualizationPromptCustom: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        socialLinks: [],
        marketingLinks: [],
        defaultRate: null,
        defaultRatePerSqYd: null,
        defaultRatePerSqM: null,
        rates: [],
        aiPromptAuditLogs: [],
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

  type RateRow = {
    id: string;
    settings_id: string;
    city: string;
    pincode: string;
    rate_per_sq_ft: number;
    rate_per_sq_yd?: number | null;
    rate_per_sq_m?: number | null;
    is_active: boolean;
  };

  let rates: RateRow[];
  try {
    rates = await sql<RateRow>`select id, settings_id, city, pincode, rate_per_sq_ft, rate_per_sq_yd, rate_per_sq_m, is_active from city_pincode_rates where settings_id = ${settings.id} order by city, pincode`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("rate_per_sq_yd") || message.includes("rate_per_sq_m")) {
      rates = await sql<RateRow>`select id, settings_id, city, pincode, rate_per_sq_ft, is_active from city_pincode_rates where settings_id = ${settings.id} order by city, pincode`;
    } else {
      throw err;
    }
  }

  const defaultRateRow = rates.find((r) => r.city === "DEFAULT" && r.pincode === "*");
  const defaultRate = defaultRateRow?.rate_per_sq_ft ?? null;
  const defaultRatePerSqYd = defaultRateRow?.rate_per_sq_yd ?? null;
  const defaultRatePerSqM = defaultRateRow?.rate_per_sq_m ?? null;
  const overrideRates = rates.filter((r) => !(r.city === "DEFAULT" && r.pincode === "*"));

  let aiPromptAuditLogs: AiPromptAuditLogRow[] = [];
  try {
    aiPromptAuditLogs = await sql<AiPromptAuditLogRow>`
      select l.id, l.prompt_key, l.action, l.previous_value, l.new_value, l.created_at,
             u.name as admin_name, u.email as admin_email
      from ai_prompt_audit_logs l
      left join users u on u.id = l.admin_user_id
      where l.settings_id = ${settings.id}
      order by l.created_at desc
      limit 25
    `;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('relation "ai_prompt_audit_logs" does not exist')) {
      throw err;
    }
  }

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
    contactEmail: settings.contact_email ?? null,
    contactPhone: settings.contact_phone ?? null,
    contactAddress: settings.contact_address ?? null,
    estimatorPromptCustom: settings.estimator_prompt_custom ?? null,
    visualizationPromptCustom: settings.visualization_prompt_custom ?? null,
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
    defaultRate,
    defaultRatePerSqYd,
    defaultRatePerSqM,
    rates: overrideRates.map((rate) => ({
      id: rate.id,
      settingsId: rate.settings_id,
      city: rate.city,
      pincode: rate.pincode,
      ratePerSqFt: rate.rate_per_sq_ft,
      ratePerSqYd: rate.rate_per_sq_yd ?? null,
      ratePerSqM: rate.rate_per_sq_m ?? null,
      isActive: rate.is_active,
    })),
    aiPromptAuditLogs: aiPromptAuditLogs.map((log) => ({
      id: log.id,
      promptKey: log.prompt_key,
      action: log.action,
      previousValue: log.previous_value,
      newValue: log.new_value,
      createdAt: log.created_at,
      adminName: log.admin_name,
      adminEmail: log.admin_email,
    })),
  };
}
