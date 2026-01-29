"use server";

import crypto from "crypto";
import {
  RoleValues,
  MilestoneStatusValues,
  PaymentStatusValues,
  PaymentTypeValues,
  ProjectStatusValues,
} from "@/lib/types";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uploadBlob } from "@/lib/blob";
import { notifyUser } from "@/lib/notifications";

export async function requestProjectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.CUSTOMER) {
    throw new Error("Unauthorized.");
  }

  const firmId = String(formData.get("firmId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!firmId || !title) {
    throw new Error("Firm and title are required.");
  }

  const [firmProfile] = await sql<{ id: string; status: string }>`
    select id, status from firm_profiles where user_id = ${firmId} limit 1
  `;

  if (!firmProfile || firmProfile.status !== "APPROVED") {
    throw new Error("Firm is not available.");
  }

  const projectId = crypto.randomUUID();
  await sql`
    insert into projects (id, customer_id, firm_id, status, title, description)
    values (
      ${projectId},
      ${user.id},
      ${firmId},
      ${ProjectStatusValues.REQUESTED},
      ${title},
      ${description || null}
    )
  `;

  const [firmUser] = await sql<{ email: string }>`
    select email from users where id = ${firmId} limit 1
  `;

  if (firmUser) {
    await notifyUser({
      userId: firmId,
      email: firmUser.email,
      type: "PROJECT_REQUEST",
      title: "New project request",
      message: `You received a new project request: ${title}`,
    });
  }

  return;
}

export async function respondProjectRequestAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (!projectId || !["accept", "reject"].includes(decision)) {
    throw new Error("Invalid request.");
  }

  const [updated] = await sql<{ id: string }>`
    update projects
    set status = ${decision === "accept" ? ProjectStatusValues.ACCEPTED : ProjectStatusValues.REJECTED},
        updated_at = now()
    where id = ${projectId} and firm_id = ${user.id}
    returning id
  `;

  if (!updated) {
    throw new Error("Project not found.");
  }

  return;
}

export async function createMilestoneAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);

  if (!projectId || !title || !amount) {
    throw new Error("All fields are required.");
  }

  const [project] = await sql<{ id: string }>`
    select id from projects where id = ${projectId} and firm_id = ${user.id} limit 1
  `;

  if (!project) {
    throw new Error("Project not found.");
  }

  await sql`
    insert into milestones (id, project_id, title, description, amount, status)
    values (
      ${crypto.randomUUID()},
      ${projectId},
      ${title},
      ${description},
      ${amount},
      ${MilestoneStatusValues.PENDING}
    )
  `;

  return;
}

export async function submitMilestoneAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const milestoneId = String(formData.get("milestoneId") ?? "");
  if (!milestoneId) {
    throw new Error("Milestone is required.");
  }

  const [milestone] = await sql<{
    id: string;
    title: string;
    project_id: string;
    customer_id: string;
    customer_email: string;
  }>`
    select m.id, m.title, m.project_id, p.customer_id, u.email as customer_email
    from milestones m
    join projects p on p.id = m.project_id
    join users u on u.id = p.customer_id
    where m.id = ${milestoneId} and p.firm_id = ${user.id}
    limit 1
  `;

  if (!milestone) {
    throw new Error("Milestone not found.");
  }

  await sql`
    update milestones
    set status = ${MilestoneStatusValues.SUBMITTED},
        updated_at = now()
    where id = ${milestone.id}
  `;

  await notifyUser({
    userId: milestone.customer_id,
    email: milestone.customer_email,
    type: "MILESTONE_SUBMITTED",
    title: "Milestone submitted",
    message: `Milestone "${milestone.title}" is ready for approval.`,
  });

  return;
}

export async function approveMilestoneAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.CUSTOMER) {
    throw new Error("Unauthorized.");
  }

  const milestoneId = String(formData.get("milestoneId") ?? "");
  if (!milestoneId) {
    throw new Error("Milestone is required.");
  }

  const [milestone] = await sql<{
    id: string;
    title: string;
    amount: number;
    project_id: string;
    customer_id: string;
    firm_id: string;
  }>`
    select m.id, m.title, m.amount, m.project_id, p.customer_id, p.firm_id
    from milestones m
    join projects p on p.id = m.project_id
    where m.id = ${milestoneId} and p.customer_id = ${user.id}
    limit 1
  `;

  if (!milestone) {
    throw new Error("Milestone not found.");
  }

  await sql`
    update milestones
    set status = ${MilestoneStatusValues.APPROVED},
        updated_at = now()
    where id = ${milestone.id}
  `;

  await sql`
    insert into payment_ledger (
      id, type, status, amount, project_id, milestone_id, customer_id, firm_id
    )
    values (
      ${crypto.randomUUID()},
      ${PaymentTypeValues.MILESTONE},
      ${PaymentStatusValues.HELD},
      ${milestone.amount},
      ${milestone.project_id},
      ${milestone.id},
      ${milestone.customer_id},
      ${milestone.firm_id}
    )
  `;

  const [firmUser] = await sql<{ email: string }>`
    select email from users where id = ${milestone.firm_id} limit 1
  `;

  if (firmUser) {
    await notifyUser({
      userId: milestone.firm_id,
      email: firmUser.email,
      type: "MILESTONE_APPROVED",
      title: "Milestone approved",
      message: `Milestone "${milestone.title}" has been approved.`,
    });
  }

  return;
}

export async function uploadMilestoneImageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== RoleValues.FIRM) {
    throw new Error("Unauthorized.");
  }

  const milestoneId = String(formData.get("milestoneId") ?? "");
  const file = formData.get("file");
  if (!milestoneId || !(file instanceof File)) {
    throw new Error("Milestone and file are required.");
  }

  const [milestone] = await sql<{ id: string }>`
    select m.id
    from milestones m
    join projects p on p.id = m.project_id
    where m.id = ${milestoneId} and p.firm_id = ${user.id}
    limit 1
  `;

  if (!milestone) {
    throw new Error("Milestone not found.");
  }

  const blobUrl = await uploadBlob(file, `milestones/${milestoneId}`);
  await sql`
    insert into milestone_images (
      id, milestone_id, blob_url, file_name, mime_type, size_bytes
    )
    values (
      ${crypto.randomUUID()},
      ${milestone.id},
      ${blobUrl},
      ${file.name},
      ${file.type},
      ${file.size}
    )
  `;

  return;
}
