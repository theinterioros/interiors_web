"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { RoleValues } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { uploadBlob } from "@/lib/blob";

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

/** Legacy no-op: digital twin renewal is not charged for customers. */
export async function payDigitalTwinRenewalAction(): Promise<{ redirect?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.CUSTOMER) {
    return { error: "Unauthorized." };
  }
  revalidatePath("/customer/digital-twin");
  revalidatePath("/customer/dashboard");
  return { redirect: "/customer/digital-twin" };
}
