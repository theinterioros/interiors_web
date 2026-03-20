import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionUser } from "@/lib/session";
import { sql } from "@/lib/db";
import { createOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { env } from "@/lib/env";
import { getAdminSettings } from "@/lib/settings";
import {
  ADDITIONAL_PROJECT_FEE_AMOUNT,
  FIRM_REGISTRATION_AMOUNT,
} from "@/lib/registrationPayments";
import {
  PaymentStatusValues,
  PaymentTypeValues,
  RoleValues,
  MilestoneStatusValues,
} from "@/lib/types";

export const runtime = "nodejs";

type Kind =
  | "CUSTOMER_REGISTRATION"
  | "FIRM_REGISTRATION"
  | "FIRM_RENEW"
  | "ADDITIONAL_PROJECT"
  | "DIGITAL_TWIN_RENEWAL"
  | "MILESTONE";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { kind?: Kind; milestoneId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const kind = body.kind;
  if (!kind) {
    return NextResponse.json({ error: "kind is required." }, { status: 400 });
  }

  // Customer registration is free now; do not create a Razorpay order/ledger entry.
  if (kind === "CUSTOMER_REGISTRATION") {
    return NextResponse.json(
      { error: "Customer registration is free now. No payment required." },
      { status: 400 }
    );
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
  }

  const ledgerId = crypto.randomUUID();
  let amountRupees = 0;
  let type: string = "";
  let customerId: string | null = null;
  let firmId: string | null = null;
  let projectId: string | null = null;
  let milestoneId: string | null = null;

  const settings = await getAdminSettings();

  try {
    if (kind === "FIRM_REGISTRATION" || kind === "FIRM_RENEW") {
      if (user.role !== RoleValues.FIRM) {
        return NextResponse.json({ error: "Invalid role." }, { status: 403 });
      }
      amountRupees = settings.designerYearlyFee ?? FIRM_REGISTRATION_AMOUNT;
      type = PaymentTypeValues.FIRM_REGISTRATION_FEE;
      firmId = user.id;
    } else if (kind === "ADDITIONAL_PROJECT") {
      if (user.role !== RoleValues.CUSTOMER) {
        return NextResponse.json({ error: "Invalid role." }, { status: 403 });
      }
      amountRupees = ADDITIONAL_PROJECT_FEE_AMOUNT;
      type = PaymentTypeValues.ADDITIONAL_PROJECT_FEE;
      customerId = user.id;
    } else if (kind === "DIGITAL_TWIN_RENEWAL") {
      if (user.role !== RoleValues.CUSTOMER) {
        return NextResponse.json({ error: "Invalid role." }, { status: 403 });
      }
      amountRupees = settings.digitalTwinYearlyFee ?? 1000;
      type = PaymentTypeValues.DIGITAL_TWIN_RENEWAL;
      customerId = user.id;
    } else if (kind === "MILESTONE") {
      if (user.role !== RoleValues.CUSTOMER) {
        return NextResponse.json({ error: "Invalid role." }, { status: 403 });
      }
      const mid = String(body.milestoneId ?? "").trim();
      if (!mid) {
        return NextResponse.json({ error: "milestoneId is required." }, { status: 400 });
      }
      const [milestone] = await sql<{
        id: string;
        amount: number;
        project_id: string;
        customer_id: string;
        firm_id: string;
        status: string;
      }>`
        select m.id, m.amount, m.project_id, p.customer_id, p.firm_id, m.status
        from milestones m
        join projects p on p.id = m.project_id
        where m.id = ${mid} and p.customer_id = ${user.id}
        limit 1
      `;
      if (!milestone || milestone.status !== MilestoneStatusValues.SUBMITTED) {
        return NextResponse.json({ error: "Milestone not found or not payable." }, { status: 400 });
      }
      const [existingHeld] = await sql<{ id: string }>`
        select id from payment_ledger
        where milestone_id = ${milestone.id} and type = ${PaymentTypeValues.MILESTONE} and status = ${PaymentStatusValues.HELD}
        limit 1
      `;
      if (existingHeld) {
        return NextResponse.json({ error: "This milestone is already paid." }, { status: 400 });
      }
      amountRupees = milestone.amount;
      type = PaymentTypeValues.MILESTONE;
      customerId = milestone.customer_id;
      firmId = milestone.firm_id;
      projectId = milestone.project_id;
      milestoneId = milestone.id;
    } else {
      return NextResponse.json({ error: "Unknown kind." }, { status: 400 });
    }

    if (amountRupees < 1) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    await sql`
      insert into payment_ledger (
        id, type, status, amount, currency, customer_id, firm_id, project_id, milestone_id
      )
      values (
        ${ledgerId},
        ${type},
        ${PaymentStatusValues.PENDING},
        ${amountRupees},
        'INR',
        ${customerId},
        ${firmId},
        ${projectId},
        ${milestoneId}
      )
    `;

    const receipt = ledgerId.replace(/-/g, "").slice(0, 40);
    const order = await createOrder({
      amountRupees,
      receipt,
      notes: { ledgerId, kind },
    });

    await sql`
      update payment_ledger
      set razorpay_order_id = ${order.orderId}, updated_at = now()
      where id = ${ledgerId}
    `;

    return NextResponse.json({
      orderId: order.orderId,
      amount: order.amount,
      currency: "INR",
      keyId: env.razorpayKeyId,
      ledgerId,
    });
  } catch (e) {
    console.error("create-order:", e);
    const message = e instanceof Error ? e.message : "Failed to create order.";
    try {
      await sql`delete from payment_ledger where id = ${ledgerId}`;
    } catch {
      // ignore
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
