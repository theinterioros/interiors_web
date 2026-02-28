"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
        google_review_links,
        platform_margin_pct,
        margin_accepted_at
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
        ${googleReviewLinks},
        5,
        now()
      )
    `;
  }

  return;
}

function isValidImageUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export async function uploadFirmPortfolioAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const file = formData.get("file") instanceof File ? (formData.get("file") as File) : null;
  const imageUrlRaw = formData.get("imageUrl");
  const imageUrl = typeof imageUrlRaw === "string" && imageUrlRaw.trim() ? imageUrlRaw.trim() : null;

  const useUrl = imageUrl && isValidImageUrl(imageUrl) && (!file || file.size === 0);
  const useFile = file && file.size > 0;

  if (!useFile && !useUrl) {
    revalidatePath("/designer/profile");
    redirect("/designer/profile?tab=portfolio&portfolioError=" + encodeURIComponent("Please upload an image file or paste an image URL."));
  }

  const [profile] = await sql<{ id: string }>`
    select id from firm_profiles where user_id = ${user.id} limit 1
  `;

  if (!profile) {
    throw new Error("Create your profile first.");
  }

  const workIdRaw = formData.get("workId");
  let workId: string | null = typeof workIdRaw === "string" && workIdRaw.trim() ? workIdRaw.trim() : null;
  const workOrderRaw = formData.get("workOrder");
  const workOrder = typeof workOrderRaw === "string" && workOrderRaw !== "" ? parseInt(workOrderRaw, 10) : null;

  if (!workId && (workOrder === null || workOrder === undefined || Number.isNaN(workOrder) || workOrder < 0 || workOrder > 4)) {
    throw new Error("Save the project first, or use a valid project slot.");
  }

  if (!workId && workOrder !== null && !Number.isNaN(workOrder) && workOrder >= 0 && workOrder <= 4) {
    const [existing] = await sql<{ id: string }>`
      select id from firm_portfolio_works where profile_id = ${profile.id} and display_order = ${workOrder} limit 1
    `;
    if (existing) {
      workId = existing.id;
    } else {
      const newWorkId = crypto.randomUUID();
      await sql`
        insert into firm_portfolio_works (id, profile_id, title, description, display_order)
        values (${newWorkId}, ${profile.id}, ${`Project ${workOrder + 1}`}, '', ${workOrder})
      `;
      workId = newWorkId;
    }
  }

  if (workId) {
    const [count] = await sql<{ n: number }>`
      select count(*)::int as n from firm_portfolio_files where work_id = ${workId}
    `;
    if (count && count.n >= 5) {
      throw new Error("Maximum 5 images per project.");
    }
  }

  const imageTitleRaw = formData.get("imageTitle");
  const fileDisplayName =
    typeof imageTitleRaw === "string" && imageTitleRaw.trim()
      ? String(imageTitleRaw).trim().slice(0, 50)
      : useFile
        ? (file!.name.slice(0, 50))
        : "Image";

  let blobUrl: string;
  let mimeType: string;
  let sizeBytes: number;

  if (useFile) {
    blobUrl = await uploadBlob(file!, `firm-portfolio/${profile.id}`);
    mimeType = file!.type || "image/jpeg";
    sizeBytes = file!.size;
  } else {
    blobUrl = imageUrl!;
    mimeType = "image/jpeg";
    sizeBytes = 0;
  }

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
        ${fileDisplayName},
        ${mimeType},
        ${sizeBytes}
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
          ${fileDisplayName},
          ${mimeType},
          ${sizeBytes}
        )
      `;
    } else {
      throw e;
    }
  }

  revalidatePath("/designer/profile");
  redirect("/designer/profile?tab=portfolio&portfolioSuccess=1");
}

export async function deleteFirmPortfolioFileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }
  const fileId = String(formData.get("fileId") ?? "").trim();
  if (!fileId) throw new Error("Missing file.");
  const [profile] = await sql<{ id: string }>`
    select id from firm_profiles where user_id = ${user.id} limit 1
  `;
  if (!profile) throw new Error("Profile not found.");
  const [file] = await sql<{ id: string }>`
    select id from firm_portfolio_files
    where id = ${fileId} and profile_id = ${profile.id}
    limit 1
  `;
  if (!file) throw new Error("Image not found or you cannot delete it.");
  await sql`delete from firm_portfolio_files where id = ${fileId}`;
  revalidatePath("/designer/profile");
  redirect("/designer/profile?tab=portfolio&portfolioSuccess=deleted");
}

export async function updateFirmPortfolioFileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }
  const fileId = String(formData.get("fileId") ?? "").trim();
  const file_name = String(formData.get("file_name") ?? "").trim().slice(0, 50);
  if (!fileId) throw new Error("Missing file.");
  const [profile] = await sql<{ id: string }>`
    select id from firm_profiles where user_id = ${user.id} limit 1
  `;
  if (!profile) throw new Error("Profile not found.");
  const [file] = await sql<{ id: string }>`
    select id from firm_portfolio_files
    where id = ${fileId} and profile_id = ${profile.id}
    limit 1
  `;
  if (!file) throw new Error("Image not found or you cannot edit it.");
  await sql`
    update firm_portfolio_files set file_name = ${file_name || "Image"} where id = ${fileId}
  `;
  revalidatePath("/designer/profile");
  redirect("/designer/profile?tab=portfolio&portfolioSuccess=updated");
}

export async function savePortfolioWorkAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const workOrder = Number(formData.get("workOrder"));
  if (Number.isNaN(workOrder) || workOrder < 0 || workOrder > 4) {
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
      const [workCount] = await sql<{ n: number }>`
        select count(*)::int as n from firm_portfolio_works where profile_id = ${profile.id}
      `;
      if (workCount && workCount.n >= 5) {
        throw new Error("Maximum 5 projects in portfolio. Remove one to add another.");
      }
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
  revalidatePath("/designer/profile");
}

/** Create a new portfolio project with optional images in one submit. */
export async function createPortfolioProjectWithImagesAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) {
    revalidatePath("/designer/profile");
    redirect("/designer/profile?tab=portfolio&portfolioError=" + encodeURIComponent("Project title is required."));
  }

  const [profile] = await sql<{ id: string }>`
    select id from firm_profiles where user_id = ${user.id} limit 1
  `;
  if (!profile) {
    throw new Error("Create your profile first.");
  }

  const [countRow] = await sql<{ n: number }>`
    select count(*)::int as n from firm_portfolio_works where profile_id = ${profile.id}
  `;
  const nextOrder = countRow?.n ?? 0;
  if (nextOrder >= 5) {
    revalidatePath("/designer/profile");
    redirect("/designer/profile?tab=portfolio&portfolioError=" + encodeURIComponent("Maximum 5 projects. Remove one to add another."));
  }

  const workId = crypto.randomUUID();
  await sql`
    insert into firm_portfolio_works (id, profile_id, title, description, display_order)
    values (${workId}, ${profile.id}, ${title}, ${description || ""}, ${nextOrder})
  `;

  for (let i = 1; i <= 5; i++) {
    const file = formData.get(`image_${i}_file`) instanceof File ? (formData.get(`image_${i}_file`) as File) : null;
    const urlRaw = formData.get(`image_${i}_url`);
    const imageUrl = typeof urlRaw === "string" && urlRaw.trim() ? urlRaw.trim() : null;
    const nameRaw = formData.get(`image_${i}_name`);
    const imageName = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim().slice(0, 50) : null;

    const useUrl = imageUrl && isValidImageUrl(imageUrl) && (!file || file.size === 0);
    const useFile = file && file.size > 0;
    if (!useFile && !useUrl) continue;

    const fileDisplayName = imageName || (useFile ? file!.name.slice(0, 50) : "Image");
    let blobUrl: string;
    let mimeType: string;
    let sizeBytes: number;

    if (useFile) {
      blobUrl = await uploadBlob(file!, `firm-portfolio/${profile.id}`);
      mimeType = file!.type || "image/jpeg";
      sizeBytes = file!.size;
    } else {
      blobUrl = imageUrl!;
      mimeType = "image/jpeg";
      sizeBytes = 0;
    }

    await sql`
      insert into firm_portfolio_files (id, profile_id, work_id, blob_url, file_name, mime_type, size_bytes)
      values (${crypto.randomUUID()}, ${profile.id}, ${workId}, ${blobUrl}, ${fileDisplayName}, ${mimeType}, ${sizeBytes})
    `;
  }

  revalidatePath("/designer/profile");
  redirect("/designer/profile?tab=portfolio&portfolioSuccess=1");
}

export async function deletePortfolioWorkAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }
  const workId = String(formData.get("workId") ?? "").trim();
  if (!workId) throw new Error("Missing project.");
  const [profile] = await sql<{ id: string }>`
    select id from firm_profiles where user_id = ${user.id} limit 1
  `;
  if (!profile) throw new Error("Profile not found.");
  const [work] = await sql<{ id: string }>`
    select id from firm_portfolio_works
    where id = ${workId} and profile_id = ${profile.id}
    limit 1
  `;
  if (!work) throw new Error("Project not found or you cannot delete it.");
  await sql`delete from firm_portfolio_files where work_id = ${workId}`;
  await sql`delete from firm_portfolio_works where id = ${workId}`;
  revalidatePath("/designer/profile");
  redirect("/designer/profile?tab=portfolio&portfolioSuccess=projectDeleted");
}
