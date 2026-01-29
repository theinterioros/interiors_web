"use server";

import crypto from "crypto";
import { RoleValues } from "@/lib/types";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uploadBlob } from "@/lib/blob";

export async function updateFirmProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();
  const experienceYears = Number(formData.get("experienceYears") ?? 0);
  const firmName = String(formData.get("firmName") ?? "").trim();
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const officeAddress = String(formData.get("officeAddress") ?? "").trim();
  const gst = String(formData.get("gst") ?? "").trim();
  const businessType = String(formData.get("businessType") ?? "").trim();
  const ticketSize = String(formData.get("ticketSize") ?? "").trim();
  const designersCount = Number(formData.get("designersCount") ?? 0) || null;
  const comments = String(formData.get("comments") ?? "").trim();

  if (!name || !city || !pincode || !about) {
    throw new Error("All fields are required.");
  }

  const [existing] = await sql<{ id: string }>`
    select id from firm_profiles where user_id = ${user.id} limit 1
  `;

  if (existing) {
    await sql`
      update firm_profiles
      set name = ${name},
          firm_name = ${firmName || null},
          owner_name = ${ownerName || null},
          office_address = ${officeAddress || null},
          gst = ${gst || null},
          business_type = ${businessType || null},
          ticket_size = ${ticketSize || null},
          designers_count = ${designersCount},
          comments = ${comments || null},
          city = ${city},
          pincode = ${pincode},
          about = ${about},
          experience_years = ${experienceYears},
          updated_at = now()
      where id = ${existing.id}
    `;
  } else {
    await sql`
      insert into firm_profiles (
        id,
        user_id,
        firm_name,
        owner_name,
        office_address,
        gst,
        business_type,
        ticket_size,
        designers_count,
        comments,
        name,
        city,
        pincode,
        about,
        experience_years
      )
      values (
        ${crypto.randomUUID()},
        ${user.id},
        ${firmName || null},
        ${ownerName || null},
        ${officeAddress || null},
        ${gst || null},
        ${businessType || null},
        ${ticketSize || null},
        ${designersCount},
        ${comments || null},
        ${name},
        ${city},
        ${pincode},
        ${about},
        ${experienceYears}
      )
    `;
  }

  return;
}

export async function uploadFirmPortfolioAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("File is required.");
  }

  const [profile] = await sql<{ id: string }>`
    select id from firm_profiles where user_id = ${user.id} limit 1
  `;

  if (!profile) {
    throw new Error("Create your profile first.");
  }

  const blobUrl = await uploadBlob(file, `firm-portfolio/${profile.id}`);
  await sql`
    insert into firm_portfolio_files (
      id, profile_id, blob_url, file_name, mime_type, size_bytes
    )
    values (
      ${crypto.randomUUID()},
      ${profile.id},
      ${blobUrl},
      ${file.name},
      ${file.type},
      ${file.size}
    )
  `;

  return;
}
