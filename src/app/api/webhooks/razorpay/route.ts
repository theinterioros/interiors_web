import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { PaymentStatusValues, PaymentTypeValues } from "@/lib/types";
import { runPostPaymentSideEffects } from "@/lib/fulfill-payment";

export const runtime = "nodejs";

type LedgerRow = {
  id: string;
  type: string;
  status: string;
  amount: number;
  customer_id: string | null;
  firm_id: string | null;
  project_id: string | null;
  milestone_id: string | null;
  razorpay_payment_id: string | null;
};

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string; status?: string } } } };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (event.event !== "payment.captured") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const entity = event.payload?.payment?.entity;
  const orderId = entity?.order_id;
  const paymentId = entity?.id;
  if (!orderId || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  const [ledger] = await sql<LedgerRow>`
    select id, type, status, amount, customer_id, firm_id, project_id, milestone_id, razorpay_payment_id
    from payment_ledger
    where razorpay_order_id = ${orderId}
    limit 1
  `;

  if (!ledger || ledger.status !== PaymentStatusValues.PENDING) {
    return NextResponse.json({ ok: true });
  }

  const nextStatus =
    ledger.type === PaymentTypeValues.MILESTONE ? PaymentStatusValues.HELD : PaymentStatusValues.RELEASED;

  const [updated] = await sql<LedgerRow>`
    update payment_ledger
    set status = ${nextStatus},
        razorpay_payment_id = ${paymentId},
        updated_at = now()
    where id = ${ledger.id}
      and status = ${PaymentStatusValues.PENDING}
      and razorpay_order_id = ${orderId}
    returning id, type, status, amount, customer_id, firm_id, project_id, milestone_id, razorpay_payment_id
  `;

  if (updated) {
    await runPostPaymentSideEffects(updated);
  }

  return NextResponse.json({ ok: true });
}
