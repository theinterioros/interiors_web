/**
 * Razorpay: orders (payments) + RazorpayX contacts/fund accounts/payouts.
 * Requires RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET. For payouts: RAZORPAY_X_ACCOUNT_NUMBER.
 */
import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "@/lib/env";

function getInstance(): Razorpay {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required.");
  }
  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
}

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

function getAuthHeader(): string {
  const secret = env.razorpayKeySecret;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is required.");
  return "Basic " + Buffer.from(env.razorpayKeyId + ":" + secret).toString("base64");
}

/** Create an order (amount in rupees; converted to paise). Receipt can be payment_ledger id. */
export async function createOrder(params: {
  amountRupees: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ orderId: string; amount: number }> {
  const instance = getInstance();
  const amountPaise = Math.round(params.amountRupees * 100);
  const order = await instance.orders.create({
    amount: amountPaise,
    currency: params.currency ?? "INR",
    receipt: params.receipt.slice(0, 40),
    notes: params.notes ?? {},
  });
  return { orderId: (order as { id: string }).id, amount: amountPaise };
}

/** Verify payment signature (from return or webhook). */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = env.razorpayKeySecret;
  if (!secret) return false;
  const body = orderId + "|" + paymentId;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

/** Verify webhook signature. */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = env.razorpayWebhookSecret;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

/** RazorpayX: create contact (for payouts). */
export async function createContact(params: {
  name: string;
  email: string;
  contact: string;
  type?: string;
  referenceId: string;
}): Promise<{ id: string }> {
  const res = await fetch(RAZORPAY_API_BASE + "/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      name: params.name,
      email: params.email,
      contact: params.contact,
      type: params.type ?? "vendor",
      reference_id: params.referenceId,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay contact failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { id: string };
  return { id: data.id };
}

/** RazorpayX: create fund account (bank). */
export async function createFundAccount(params: {
  contactId: string;
  accountHolderName: string;
  ifsc: string;
  accountNumber: string;
}): Promise<{ id: string }> {
  const res = await fetch(RAZORPAY_API_BASE + "/fund_accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      contact_id: params.contactId,
      account_type: "bank_account",
      bank_account: {
        name: params.accountHolderName,
        ifsc: params.ifsc,
        account_number: params.accountNumber,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay fund account failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { id: string };
  return { id: data.id };
}

/** RazorpayX: create payout to designer's fund account. Amount in rupees (converted to paise). Requires RAZORPAY_X_ACCOUNT_NUMBER. */
export async function createPayout(params: {
  fundAccountId: string;
  amountRupees: number;
  currency?: string;
  referenceId: string;
  narration?: string;
  idempotencyKey: string;
}): Promise<{ id: string; status: string }> {
  const accountNumber = env.razorpayXAccountNumber;
  if (!accountNumber) {
    throw new Error("RAZORPAY_X_ACCOUNT_NUMBER is required for payouts. Set it in RazorpayX Dashboard → Banking.");
  }
  const amountPaise = Math.round(params.amountRupees * 100);
  const res = await fetch(RAZORPAY_API_BASE + "/payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      "X-Payout-Idempotency": params.idempotencyKey,
    },
    body: JSON.stringify({
      account_number: accountNumber,
      fund_account_id: params.fundAccountId,
      amount: amountPaise,
      currency: params.currency ?? "INR",
      mode: "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: params.referenceId,
      narration: params.narration ?? "Milestone payout",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay payout failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { id: string; status: string };
  return { id: data.id, status: data.status };
}

export function isRazorpayConfigured(): boolean {
  return Boolean(env.razorpayKeyId && env.razorpayKeySecret);
}
