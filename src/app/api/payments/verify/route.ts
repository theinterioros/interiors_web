import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";
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
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
};

export async function POST(request: Request) {
  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    ledgerId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");
  const ledgerIdIn = String(body.ledgerId ?? "").trim();

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
  }

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let ledger: LedgerRow | undefined;

  if (ledgerIdIn) {
    const [byId] = await sql<LedgerRow>`
      select id, type, status, amount, customer_id, firm_id, project_id, milestone_id, razorpay_order_id, razorpay_payment_id
      from payment_ledger
      where id = ${ledgerIdIn} and razorpay_order_id = ${orderId}
      limit 1
    `;
    ledger = byId;
  }

  if (!ledger) {
    const [byOrder] = await sql<LedgerRow>`
      select id, type, status, amount, customer_id, firm_id, project_id, milestone_id, razorpay_order_id, razorpay_payment_id
      from payment_ledger
      where razorpay_order_id = ${orderId}
      limit 1
    `;
    ledger = byOrder;
  }

  if (!ledger) {
    return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
  }

  if (ledger.razorpay_payment_id === paymentId && ledger.status !== PaymentStatusValues.PENDING) {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
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

  if (!updated) {
    if (ledger.razorpay_payment_id === paymentId) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }
    return NextResponse.json({ error: "Payment could not be applied." }, { status: 409 });
  }

  await runPostPaymentSideEffects(updated);

  return NextResponse.json({ ok: true });
}
