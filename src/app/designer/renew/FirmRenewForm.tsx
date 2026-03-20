"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { renewFirmSubscriptionAction } from "@/app/actions/auth";
import PaymentCheckoutModal from "@/components/ui/PaymentCheckoutModal";

export default function FirmRenewForm({ amount }: { amount: number }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn btn-primary w-full" onClick={() => setModalOpen(true)}>
        Pay ₹{amount.toLocaleString()} — extend by 1 year
      </button>
      <PaymentCheckoutModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amountRupees={amount}
        title="Designer subscription renewal"
        subtitle="Adds one year to your subscription."
        kind="FIRM_RENEW"
        mockPay={async () => {
          const r = await renewFirmSubscriptionAction();
          if (r?.error) throw new Error(r.error);
        }}
        onPaid={async () => {
          router.push("/designer/profile");
        }}
      />
    </>
  );
}
