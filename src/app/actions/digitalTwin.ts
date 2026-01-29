"use server";

import crypto from "crypto";
import {
  RoleValues,
  PaymentStatusValues,
  PaymentTypeValues,
  SubscriptionStatusValues,
} from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { uploadBlob } from "@/lib/blob";
import { getAdminSettings } from "@/lib/settings";

export async function uploadDigitalTwinFileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.CUSTOMER) {
    throw new Error("Unauthorized.");
  }

  const file = formData.get("file");
  const category = String(formData.get("category") ?? "OTHER");
  if (!(file instanceof File)) {
    throw new Error("File is required.");
  }

  const [subscription] = await sql<{
    id: string;
    expires_at: Date;
  }>`
    select id, expires_at
    from digital_twin_subscriptions
    where customer_id = ${user.id}
    limit 1
  `;

  if (!subscription) {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await sql`
      insert into digital_twin_subscriptions (
        id, customer_id, status, started_at, expires_at
      )
      values (
        ${crypto.randomUUID()},
        ${user.id},
        ${SubscriptionStatusValues.ACTIVE},
        ${new Date()},
        ${expiresAt}
      )
    `;
  } else if (new Date(subscription.expires_at) < new Date()) {
    const settings = await getAdminSettings();
    await sql`
      insert into payment_ledger (
        id, type, status, amount, customer_id
      )
      values (
        ${crypto.randomUUID()},
        ${PaymentTypeValues.DIGITAL_TWIN_RENEWAL},
        ${PaymentStatusValues.HELD},
        ${settings.digitalTwinYearlyFee},
        ${user.id}
      )
    `;

    const newExpiry = new Date();
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    await sql`
      update digital_twin_subscriptions
      set status = ${SubscriptionStatusValues.ACTIVE},
          expires_at = ${newExpiry},
          last_charged_at = ${new Date()}
      where id = ${subscription.id}
    `;
  }

  const blobUrl = await uploadBlob(file, `digital-twin/${user.id}`);
  const safeCategory = ["WIRING", "PLUMBING", "FLOOR_PLAN", "HANDOVER", "OTHER"].includes(
    category
  )
    ? category
    : "OTHER";

  await sql`
    insert into digital_twin_files (
      id, customer_id, category, blob_url, file_name, mime_type, size_bytes, uploaded_by
    )
    values (
      ${crypto.randomUUID()},
      ${user.id},
      ${safeCategory},
      ${blobUrl},
      ${file.name},
      ${file.type},
      ${file.size},
      ${user.id}
    )
  `;

  return;
}
