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
  const googleReviewLinks = String(formData.get("googleReviewLinks") ?? "").trim() || null;

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
          google_review_links = ${googleReviewLinks},
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
        experience_years,
        google_review_links
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
        ${experienceYears},
        ${googleReviewLinks}
      )
    `;
  }

  return;
}

/** Designer submits a margin request (%). Creates a new row in margin_requests for the trail. */
export async function submitMarginRequestAction(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    return { error: "Unauthorized." };
  }
  const pct = Number(formData.get("marginPct"));
  if (Number.isNaN(pct) || pct < 0 || pct > 100) {
    return { error: "Enter a margin between 0 and 100%." };
  }
  const [profile] = await sql<{ id: string }>`select id from firm_profiles where user_id = ${user.id} limit 1`;
  if (!profile) {
    return { error: "Profile not found." };
  }
  try {
    await sql`
      insert into margin_requests (id, profile_id, requested_margin_pct, status)
      values (${crypto.randomUUID()}, ${profile.id}, ${pct}, 'PENDING')
    `;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("margin_requests") && msg.includes("does not exist")) {
      return { error: "Margin requests are not set up yet. Please run the database migration." };
    }
    throw e;
  }
  return {};
}

/** Designer accepts the platform margin (allowed before profile approval). Next step is pay subscription; then admin can approve profile. */
export async function acceptMarginAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }
  await sql`
    update firm_profiles
    set margin_accepted_at = now(), updated_at = now()
    where user_id = ${user.id} and margin_accepted_at is null
  `;
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

  const workIdRaw = formData.get("workId");
  const workId = typeof workIdRaw === "string" && workIdRaw.trim() ? workIdRaw.trim() : null;

  if (workId) {
    const [count] = await sql<{ n: number }>`
      select count(*)::int as n from firm_portfolio_files where work_id = ${workId}
    `;
    if (count && count.n >= 3) {
      throw new Error("Maximum 3 images per work.");
    }
  }

  const blobUrl = await uploadBlob(file, `firm-portfolio/${profile.id}`);
  try {
    await sql`
      insert into firm_portfolio_files (
        id, profile_id, work_id, blob_url, file_name, mime_type, size_bytes
      )
      values (
        ${crypto.randomUUID()},
        ${profile.id},
        ${workId},
        ${blobUrl},
        ${file.name},
        ${file.type},
        ${file.size}
      )
    `;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("work_id")) {
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
    } else {
      throw e;
    }
  }

  return;
}

export async function savePortfolioWorkAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const workOrder = Number(formData.get("workOrder"));
  if (Number.isNaN(workOrder) || workOrder < 0 || workOrder > 2) {
    throw new Error("Invalid work slot.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) {
    throw new Error("Work title is required.");
  }

  const [profile] = await sql<{ id: string }>`
    select id from firm_profiles where user_id = ${user.id} limit 1
  `;
  if (!profile) {
    throw new Error("Create your profile first.");
  }

  try {
    const [existing] = await sql<{ id: string }>`
      select id from firm_portfolio_works
      where profile_id = ${profile.id} and display_order = ${workOrder}
      limit 1
    `;
    if (existing) {
      await sql`
        update firm_portfolio_works
        set title = ${title}, description = ${description}, updated_at = now()
        where id = ${existing.id}
      `;
    } else {
      await sql`
        insert into firm_portfolio_works (id, profile_id, title, description, display_order)
        values (${crypto.randomUUID()}, ${profile.id}, ${title}, ${description}, ${workOrder})
      `;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("firm_portfolio_works") || msg.includes("does not exist")) {
      return; // table not migrated yet
    }
    throw e;
  }
}
