"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { payFirmRegistrationAction } from "@/app/actions/auth";
import PaymentCheckoutModal from "@/components/ui/PaymentCheckoutModal";

export default function FirmRegisterPayForm({ amount }: { amount: number }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn btn-primary w-full" onClick={() => setModalOpen(true)}>
        Pay ₹{amount.toLocaleString()}/year
      </button>
      <PaymentCheckoutModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amountRupees={amount}
        title="Designer yearly subscription"
        subtitle="Access your dashboard, get listed, and receive leads."
        kind="FIRM_REGISTRATION"
        mockPay={async () => {
          const r = await payFirmRegistrationAction();
          if (r?.error) throw new Error(r.error);
        }}
        onPaid={async () => {
          router.push("/designer/dashboard");
        }}
      />
    </>
  );
}
