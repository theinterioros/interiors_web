"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { payCustomerSubscriptionAction } from "@/app/actions/auth";
import PaymentCheckoutModal from "@/components/ui/PaymentCheckoutModal";

export default function CustomerSubscribeForm({ amount }: { amount: number }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn btn-primary w-full" onClick={() => setModalOpen(true)}>
        Pay ₹{amount.toLocaleString()}
      </button>
      <PaymentCheckoutModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amountRupees={amount}
        title="Customer registration"
        subtitle="One-time fee. Entitles you to one project."
        kind="CUSTOMER_REGISTRATION"
        mockPay={async () => {
          const r = await payCustomerSubscriptionAction();
          if (r?.error) throw new Error(r.error);
        }}
        onPaid={async () => {
          router.push("/customer/dashboard");
        }}
      />
    </>
  );
}
