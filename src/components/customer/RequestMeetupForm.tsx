"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestProjectAction, checkProjectLimitAction } from "@/app/actions/project";
import { payAdditionalProjectFeeAction } from "@/app/actions/auth";
import PaymentCheckoutModal from "@/components/ui/PaymentCheckoutModal";
type Props = {
  firmId: string;
  additionalProjectFeeAmount: number;
};

export default function RequestMeetupForm({ firmId, additionalProjectFeeAmount }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingTitle, setPendingTitle] = useState("");
  const [pendingDescription, setPendingDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitRequest(title: string, description: string) {
    setError(null);
    const formData = new FormData();
    formData.set("firmId", firmId);
    formData.set("title", title);
    formData.set("description", description);
    const result = await requestProjectAction(formData);
    if (result.ok) {
      router.push(`/customer/projects/${result.projectId}`);
      return;
    }
    if (result.error === "PROJECT_LIMIT_REACHED") {
      setPendingTitle(title);
      setPendingDescription(description);
      setModalOpen(true);
      return;
    }
    setError(result.error);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement)?.value?.trim() ?? "";
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement)?.value?.trim() ?? "";
    if (!title) {
      setError("Project title is required.");
      setSubmitting(false);
      return;
    }
    const limit = await checkProjectLimitAction();
    if (!limit.allowed) {
      setPendingTitle(title);
      setPendingDescription(description);
      setModalOpen(true);
      setSubmitting(false);
      return;
    }
    await submitRequest(title, description);
    setSubmitting(false);
  }

  async function afterAdditionalFeePaid() {
    await submitRequest(pendingTitle, pendingDescription);
    setModalOpen(false);
  }

  return (
    <>
      <form onSubmit={handleFormSubmit} className="card space-y-4">
        <input type="hidden" name="firmId" value={firmId} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Project title</label>
          <input name="title" required className="input" placeholder="e.g. 3BHK interior design" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Project details</label>
          <textarea name="description" rows={4} className="input" placeholder="Brief description" />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Submitting…" : "Request Meetup"}
          </button>
        </div>
      </form>
      <PaymentCheckoutModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amountRupees={additionalProjectFeeAmount}
        title="New project fee"
        subtitle="Your subscription includes one project. Pay to start another."
        kind="ADDITIONAL_PROJECT"
        mockPay={payAdditionalProjectFeeAction}
        onPaid={afterAdditionalFeePaid}
      />
    </>
  );
}
