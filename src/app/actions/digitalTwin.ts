"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
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
  const projectIdRaw = formData.get("projectId");
  const projectId = typeof projectIdRaw === "string" && projectIdRaw.trim() ? projectIdRaw.trim() : null;
  const fileNameRaw = formData.get("fileName");
  const fileDisplayName =
    typeof fileNameRaw === "string" && fileNameRaw.trim()
      ? String(fileNameRaw).trim().slice(0, 200)
      : null;

  if (!(file instanceof File)) {
    throw new Error("File is required.");
  }

  if (projectId) {
    const [project] = await sql<{ id: string }>`
      select id from projects where id = ${projectId} and customer_id = ${user.id} limit 1
    `;
    if (!project) {
      throw new Error("Project not found.");
    }
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
  const storedFileName = fileDisplayName || file.name;

  await sql`
    insert into digital_twin_files (
      id, customer_id, project_id, category, blob_url, file_name, mime_type, size_bytes, uploaded_by
    )
    values (
      ${crypto.randomUUID()},
      ${user.id},
      ${projectId},
      ${safeCategory},
      ${blobUrl},
      ${storedFileName},
      ${file.type},
      ${file.size},
      ${user.id}
    )
  `;

  revalidatePath("/customer/digital-twin");
  return;
}

/** Renew digital twin subscription (extends by 1 year). */
export async function payDigitalTwinRenewalAction(): Promise<{ redirect?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.CUSTOMER) {
    return { error: "Unauthorized." };
  }

  const settings = await getAdminSettings();
  const amount = settings.digitalTwinYearlyFee ?? 1000;

  const [subscription] = await sql<{ id: string; expires_at: Date }>`
    select id, expires_at from digital_twin_subscriptions where customer_id = ${user.id} limit 1
  `;

  const now = new Date();
  const currentExpiry = subscription ? new Date(subscription.expires_at) : null;
  const newExpiry = new Date(currentExpiry && currentExpiry > now ? currentExpiry : now);
  newExpiry.setFullYear(newExpiry.getFullYear() + 1);

  await sql`
    insert into payment_ledger (id, type, status, amount, currency, customer_id)
    values (${crypto.randomUUID()}, ${PaymentTypeValues.DIGITAL_TWIN_RENEWAL}, ${PaymentStatusValues.RELEASED}, ${amount}, 'INR', ${user.id})
  `;

  if (subscription) {
    await sql`
      update digital_twin_subscriptions
      set status = ${SubscriptionStatusValues.ACTIVE}, expires_at = ${newExpiry}, last_charged_at = ${now}
      where id = ${subscription.id}
    `;
  } else {
    await sql`
      insert into digital_twin_subscriptions (id, customer_id, status, started_at, expires_at, last_charged_at)
      values (${crypto.randomUUID()}, ${user.id}, ${SubscriptionStatusValues.ACTIVE}, ${now}, ${newExpiry}, ${now})
    `;
  }

  revalidatePath("/customer/digital-twin");
  revalidatePath("/customer/dashboard");
  return { redirect: "/customer/digital-twin" };
}
