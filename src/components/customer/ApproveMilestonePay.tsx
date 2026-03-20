"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveMilestoneAction } from "@/app/actions/project";
import PaymentCheckoutModal from "@/components/ui/PaymentCheckoutModal";

type Props = {
  milestoneId: string;
  amount: number;
  title: string;
};

export default function ApproveMilestonePay({ milestoneId, amount, title }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  async function mockPay() {
    const formData = new FormData();
    formData.set("milestoneId", milestoneId);
    await approveMilestoneAction(formData);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="btn btn-primary text-base px-6 py-3 font-semibold shadow-lg"
      >
        Approve & Pay
      </button>
      <PaymentCheckoutModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amountRupees={amount}
        title={`Milestone: ${title}`}
        subtitle="Funds are held in escrow until admin releases to the designer."
        kind="MILESTONE"
        milestoneId={milestoneId}
        mockPay={mockPay}
        onPaid={async () => {
          router.refresh();
        }}
      />
    </>
  );
}
