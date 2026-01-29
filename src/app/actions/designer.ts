"use server";

import { Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadBlob } from "@/lib/blob";

export async function updateDesignerProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.DESIGNER) {
    return { ok: false, error: "Unauthorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();
  const experienceYears = Number(formData.get("experienceYears") ?? 0);

  if (!name || !city || !pincode || !about) {
    return { ok: false, error: "All fields are required." };
  }

  await prisma.designerProfile.upsert({
    where: { userId: user.id },
    update: {
      name,
      city,
      pincode,
      about,
      experienceYears,
    },
    create: {
      userId: user.id,
      name,
      city,
      pincode,
      about,
      experienceYears,
    },
  });

  return { ok: true };
}

export async function uploadPortfolioAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.DESIGNER) {
    return { ok: false, error: "Unauthorized." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "File is required." };
  }

  const profile = await prisma.designerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return { ok: false, error: "Create your profile first." };
  }

  const blobUrl = await uploadBlob(file, `designer-portfolio/${profile.id}`);
  await prisma.designerPortfolioFile.create({
    data: {
      profileId: profile.id,
      blobUrl,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });

  return { ok: true };
}
