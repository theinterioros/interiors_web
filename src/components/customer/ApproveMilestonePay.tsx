"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveMilestoneAction } from "@/app/actions/project";
import MockPaymentModal from "@/components/ui/MockPaymentModal";

type Props = {
  milestoneId: string;
  amount: number;
  title: string;
};

export default function ApproveMilestonePay({ milestoneId, amount, title }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleConfirm() {
    const formData = new FormData();
    formData.set("milestoneId", milestoneId);
    await approveMilestoneAction(formData);
    router.refresh();
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
      <MockPaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={amount}
        title={`Milestone: ${title}`}
        subtitle="Funds will be held in escrow until admin releases to the designer."
        onConfirm={handleConfirm}
      />
    </>
  );
}
