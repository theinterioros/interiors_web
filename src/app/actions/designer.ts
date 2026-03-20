"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RoleValues } from "@/lib/types";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uploadBlob } from "@/lib/blob";
import { createContact, createFundAccount, isRazorpayConfigured } from "@/lib/razorpay";

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

  const pincodeDigits = pincode.trim();
  if (!/^\d{6}$/.test(pincodeDigits)) {
    throw new Error("Pincode must be exactly 6 digits.");
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
          pincode = ${pincodeDigits},
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
        ${pincodeDigits},
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

/** Check if designer has bank account (for milestone payouts). */
export async function designerHasBankAccount(userId: string): Promise<boolean> {
  const [row] = await sql<{ id: string }>`
    select id from designer_bank_accounts where user_id = ${userId} limit 1
  `;
  return Boolean(row?.id);
}

function profileBankTab(params: string): string {
  return `/designer/profile?tab=bank${params ? `&${params}` : ""}`;
}

/** Save or update designer bank account (RazorpayX contact + fund account). Required for receiving milestone payouts. */
export async function saveDesignerBankAccountAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    redirect(profileBankTab("bankError=" + encodeURIComponent("Unauthorized.")));
  }
  if (!isRazorpayConfigured()) {
    redirect(profileBankTab("bankError=" + encodeURIComponent("Payments are not configured. Please try again later.")));
  }

  const accountHolderName = String(formData.get("accountHolderName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").replace(/\s/g, "");
  const confirmAccountNumber = String(formData.get("confirmAccountNumber") ?? "").replace(/\s/g, "");
  const ifsc = String(formData.get("ifsc") ?? "").trim().toUpperCase();

  if (!accountHolderName || accountHolderName.length < 3) {
    redirect(profileBankTab("bankError=" + encodeURIComponent("Account holder name is required (min 3 characters).")));
  }
  if (!accountNumber || accountNumber.length < 9) {
    redirect(profileBankTab("bankError=" + encodeURIComponent("Valid account number is required.")));
  }
  if (accountNumber !== confirmAccountNumber) {
    redirect(profileBankTab("bankError=" + encodeURIComponent("Account number and confirm account number do not match. Please re-enter.")));
  }
  if (!ifsc || ifsc.length !== 11) {
    redirect(profileBankTab("bankError=" + encodeURIComponent("IFSC code must be 11 characters.")));
  }

  const [userRow] = await sql<{ email: string; phone: string | null }>`
    select email, phone from users where id = ${user.id} limit 1
  `;
  const email = userRow?.email ?? "";
  const phone = (userRow?.phone ?? "").replace(/\D/g, "").slice(0, 10) || "0000000000";

  try {
    const contact = await createContact({
      name: accountHolderName,
      email: email || `designer-${user.id}@placeholder.in`,
      contact: phone,
      type: "vendor",
      referenceId: user.id.slice(0, 40),
    });
    const fundAccount = await createFundAccount({
      contactId: contact.id,
      accountHolderName,
      ifsc,
      accountNumber,
    });
    const accountLast4 = accountNumber.slice(-4);

    await sql`delete from designer_bank_accounts where user_id = ${user.id}`;
    await sql`
      insert into designer_bank_accounts (id, user_id, razorpay_contact_id, razorpay_fund_account_id, account_holder_name, ifsc, account_last4, updated_at)
      values (${crypto.randomUUID()}, ${user.id}, ${contact.id}, ${fundAccount.id}, ${accountHolderName}, ${ifsc}, ${accountLast4}, now())
    `;
    revalidatePath("/designer/profile");
    revalidatePath("/designer/projects");
    redirect(profileBankTab("bankSuccess=1"));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save bank account.";
    redirect(profileBankTab("bankError=" + encodeURIComponent(message)));
  }
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
