"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { payCustomerSubscriptionAction } from "@/app/actions/auth";
import MockPaymentModal from "@/components/ui/MockPaymentModal";

export default function CustomerSubscribeForm({ amount }: { amount: number }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleConfirm() {
    const result = await payCustomerSubscriptionAction();
    if (result?.redirect) {
      setModalOpen(false);
      router.push(result.redirect);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="btn btn-primary w-full"
      >
        Pay ₹{amount.toLocaleString()} (mock payment)
      </button>
      <MockPaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={amount}
        title="Customer registration"
        subtitle="One-time fee. Entitles you to one project."
        onConfirm={handleConfirm}
      />
    </>
  );
}
