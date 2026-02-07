"use client";

import { releasePaymentAction } from "@/app/actions/admin";
import { useRef, useState } from "react";

type Props = {
  paymentId: string;
  amount: number;
  designerName: string;
  expectedMargin: number | null;
};

export default function ReleasePaymentButton({ paymentId, amount, designerName, expectedMargin }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const margin = expectedMargin ?? 0;
  const netToDesigner = amount - margin;

  function handleConfirm() {
    setOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary text-sm">
        Release to designer
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="release-dialog-title">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg max-w-md w-full p-5">
            <h2 id="release-dialog-title" className="font-semibold text-[var(--foreground)] mb-3">
              Release payment to designer?
            </h2>
            <div className="text-sm text-[var(--text-muted)] space-y-2 mb-4">
              <p><strong className="text-[var(--foreground)]">Designer:</strong> {designerName}</p>
              <p><strong className="text-[var(--foreground)]">Amount:</strong> ₹{amount.toLocaleString()}</p>
              <p><strong className="text-[var(--foreground)]">Platform margin:</strong> {expectedMargin != null ? `₹${expectedMargin.toLocaleString()}` : "—"}</p>
              <p><strong className="text-[var(--foreground)]">Net to designer:</strong> ₹{netToDesigner.toLocaleString()}</p>
              <p className="pt-2">Designer and customer will be notified after release.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={handleConfirm} className="btn btn-primary">
                Confirm release
              </button>
            </div>
          </div>
        </div>
      )}
      <form ref={formRef} action={releasePaymentAction} className="hidden">
        <input type="hidden" name="paymentId" value={paymentId} />
      </form>
    </>
  );
}
