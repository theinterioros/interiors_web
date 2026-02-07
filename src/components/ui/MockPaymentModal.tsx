"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  subtitle?: string;
  onConfirm: () => Promise<void>;
};

export default function MockPaymentModal({
  open,
  onClose,
  amount,
  title,
  subtitle,
  onConfirm,
}: Props) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setProcessing(false);
      setError(null);
    }
  }, [open]);

  async function handlePay() {
    setError(null);
    setProcessing(true);
    // 2-second mock payment animation
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setProcessing(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mock-payment-title"
    >
      <div className="card w-full max-w-md shadow-xl">
        <h2 id="mock-payment-title" className="heading-md mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-[var(--text-muted)] mb-4">{subtitle}</p>
        )}
        <div className="flex items-baseline gap-2 mb-6">
          <IndianRupee className="h-6 w-6 text-[var(--foreground)]" />
          <span className="text-3xl font-bold text-[var(--foreground)]">
            {amount.toLocaleString()}
          </span>
        </div>
        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={processing}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              `Pay ₹${amount.toLocaleString()} (mock)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
