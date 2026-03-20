"use client";

import { useCallback, useEffect, useState } from "react";
import { IndianRupee, Loader2 } from "lucide-react";
import MockPaymentModal from "@/components/ui/MockPaymentModal";

export type PaymentCheckoutKind =
  | "CUSTOMER_REGISTRATION"
  | "FIRM_REGISTRATION"
  | "FIRM_RENEW"
  | "ADDITIONAL_PROJECT"
  | "DIGITAL_TWIN_RENEWAL"
  | "MILESTONE";

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Shown to user; server may charge a different amount for some kinds */
  amountRupees: number;
  title: string;
  subtitle?: string;
  kind: PaymentCheckoutKind;
  milestoneId?: string;
  /** When Razorpay is off or order creation fails with 503 */
  mockPay: () => Promise<void>;
  /** After successful Razorpay verify or mock pay */
  onPaid?: () => Promise<void>;
};

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
    document.body.appendChild(s);
  });
}

export default function PaymentCheckoutModal({
  open,
  onClose,
  amountRupees,
  title,
  subtitle,
  kind,
  milestoneId,
  mockPay,
  onPaid,
}: Props) {
  const [useMock, setUseMock] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setUseMock(false);
      setBusy(false);
      setError(null);
    }
  }, [open]);

  const runRazorpay = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, milestoneId }),
      });
      const data = (await res.json()) as {
        error?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        ledgerId?: string;
      };

      if (res.status === 503) {
        setUseMock(true);
        setBusy(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Could not start payment.");
      }

      if (!data.orderId || !data.keyId || !data.amount || !data.ledgerId) {
        throw new Error("Invalid payment session.");
      }

      await loadRazorpayScript();
      const RZP = window.Razorpay;
      if (!RZP) throw new Error("Razorpay Checkout unavailable.");

      const rzp = new RZP({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency ?? "INR",
        order_id: data.orderId,
        name: "Interior OS",
        description: title,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const v = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ledgerId: data.ledgerId,
            }),
          });
          const vr = await v.json().catch(() => ({}));
          if (!v.ok) {
            setError((vr as { error?: string }).error || "Payment verification failed.");
            return;
          }
          await onPaid?.();
          onClose();
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
          },
        },
        theme: { color: "#0f766e" },
      });

      rzp.open();
      setBusy(false);
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Payment failed to start.");
    }
  }, [kind, milestoneId, title, onClose, onPaid]);

  if (!open) return null;

  if (useMock) {
    return (
      <MockPaymentModal
        open={open}
        onClose={onClose}
        amount={amountRupees}
        title={title}
        subtitle={subtitle ?? "Simulated payment (Razorpay not configured)."}
        onConfirm={async () => {
          await mockPay();
          await onPaid?.();
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-payment-title"
    >
      <div className="card w-full max-w-md shadow-xl">
        <h2 id="checkout-payment-title" className="heading-md mb-2">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-[var(--text-muted)] mb-4">{subtitle}</p>}
        <div className="flex items-baseline gap-2 mb-6">
          <IndianRupee className="h-6 w-6 text-[var(--foreground)]" />
          <span className="text-3xl font-bold text-[var(--foreground)]">{amountRupees.toLocaleString()}</span>
          <span className="text-sm text-[var(--text-muted)]">INR</span>
        </div>
        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void runRazorpay()}
            disabled={busy}
            className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Please wait…
              </>
            ) : (
              "Pay now"
            )}
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Secured by Razorpay. If checkout does not open, ensure keys are set or use mock mode in development.
        </p>
      </div>
    </div>
  );
}
