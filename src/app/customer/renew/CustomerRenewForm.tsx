"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { payDigitalTwinRenewalAction } from "@/app/actions/digitalTwin";
import PaymentCheckoutModal from "@/components/ui/PaymentCheckoutModal";

export default function CustomerRenewForm({ amount }: { amount: number }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn btn-primary w-full" onClick={() => setModalOpen(true)}>
        Pay ₹{amount.toLocaleString()} & extend by 1 year
      </button>
      <PaymentCheckoutModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amountRupees={amount}
        title="Digital Twin subscription"
        subtitle="Renew to keep uploading and organising project files."
        kind="DIGITAL_TWIN_RENEWAL"
        mockPay={async () => {
          const r = await payDigitalTwinRenewalAction();
          if (r?.error) throw new Error(r.error);
        }}
        onPaid={async () => {
          router.push("/customer/digital-twin");
        }}
      />
    </>
  );
}
