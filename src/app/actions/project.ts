"use server";

import { Role, MilestoneStatus, PaymentStatus, PaymentType, ProjectStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadBlob } from "@/lib/blob";
import { notifyUser } from "@/lib/notifications";

export async function requestProjectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.CUSTOMER) {
    return { ok: false, error: "Unauthorized." };
  }

  const designerId = String(formData.get("designerId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!designerId || !title) {
    return { ok: false, error: "Designer and title are required." };
  }

  const designerProfile = await prisma.designerProfile.findUnique({
    where: { userId: designerId },
  });

  if (!designerProfile || designerProfile.status !== "APPROVED") {
    return { ok: false, error: "Designer is not available." };
  }

  const project = await prisma.project.create({
    data: {
      customerId: user.id,
      designerId,
      title,
      description,
      status: ProjectStatus.REQUESTED,
    },
    include: { designer: true, customer: true },
  });

  await notifyUser({
    userId: project.designerId,
    email: project.designer.email,
    type: "PROJECT_REQUEST",
    title: "New project request",
    message: `You received a new project request: ${project.title}`,
  });

  return { ok: true };
}

export async function respondProjectRequestAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.DESIGNER) {
    return { ok: false, error: "Unauthorized." };
  }

  const projectId = String(formData.get("projectId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (!projectId || !["accept", "reject"].includes(decision)) {
    return { ok: false, error: "Invalid request." };
  }

  const updated = await prisma.project.updateMany({
    where: { id: projectId, designerId: user.id },
    data: {
      status: decision === "accept" ? ProjectStatus.ACCEPTED : ProjectStatus.REJECTED,
    },
  });

  if (!updated.count) {
    return { ok: false, error: "Project not found." };
  }

  return { ok: true };
}

export async function createMilestoneAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.DESIGNER) {
    return { ok: false, error: "Unauthorized." };
  }

  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);

  if (!projectId || !title || !amount) {
    return { ok: false, error: "All fields are required." };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, designerId: user.id },
  });

  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  await prisma.milestone.create({
    data: {
      projectId,
      title,
      description,
      amount,
      status: MilestoneStatus.PENDING,
    },
  });

  return { ok: true };
}

export async function submitMilestoneAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.DESIGNER) {
    return { ok: false, error: "Unauthorized." };
  }

  const milestoneId = String(formData.get("milestoneId") ?? "");
  if (!milestoneId) {
    return { ok: false, error: "Milestone is required." };
  }

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, project: { designerId: user.id } },
    include: { project: { include: { customer: true } } },
  });

  if (!milestone) {
    return { ok: false, error: "Milestone not found." };
  }

  await prisma.milestone.update({
    where: { id: milestone.id },
    data: { status: MilestoneStatus.SUBMITTED },
  });

  await notifyUser({
    userId: milestone.project.customerId,
    email: milestone.project.customer.email,
    type: "MILESTONE_SUBMITTED",
    title: "Milestone submitted",
    message: `Milestone "${milestone.title}" is ready for approval.`,
  });

  return { ok: true };
}

export async function approveMilestoneAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.CUSTOMER) {
    return { ok: false, error: "Unauthorized." };
  }

  const milestoneId = String(formData.get("milestoneId") ?? "");
  if (!milestoneId) {
    return { ok: false, error: "Milestone is required." };
  }

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, project: { customerId: user.id } },
    include: { project: true },
  });

  if (!milestone) {
    return { ok: false, error: "Milestone not found." };
  }

  await prisma.milestone.update({
    where: { id: milestone.id },
    data: { status: MilestoneStatus.APPROVED },
  });

  await prisma.paymentLedger.create({
    data: {
      type: PaymentType.MILESTONE,
      status: PaymentStatus.HELD,
      amount: milestone.amount,
      projectId: milestone.projectId,
      milestoneId: milestone.id,
      customerId: milestone.project.customerId,
      designerId: milestone.project.designerId,
    },
  });

  const project = await prisma.project.findUnique({
    where: { id: milestone.projectId },
    include: { designer: true },
  });

  if (project?.designer) {
    await notifyUser({
      userId: project.designerId,
      email: project.designer.email,
      type: "MILESTONE_APPROVED",
      title: "Milestone approved",
      message: `Milestone "${milestone.title}" has been approved.`,
    });
  }

  return { ok: true };
}

export async function uploadMilestoneImageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.DESIGNER) {
    return { ok: false, error: "Unauthorized." };
  }

  const milestoneId = String(formData.get("milestoneId") ?? "");
  const file = formData.get("file");
  if (!milestoneId || !(file instanceof File)) {
    return { ok: false, error: "Milestone and file are required." };
  }

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, project: { designerId: user.id } },
  });

  if (!milestone) {
    return { ok: false, error: "Milestone not found." };
  }

  const blobUrl = await uploadBlob(file, `milestones/${milestoneId}`);
  await prisma.milestoneImage.create({
    data: {
      milestoneId: milestone.id,
      blobUrl,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });

  return { ok: true };
}
