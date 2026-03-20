"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestProjectAction, checkProjectLimitAction } from "@/app/actions/project";
import { payAdditionalProjectFeeAction } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";
import PaymentCheckoutModal from "@/components/ui/PaymentCheckoutModal";
import PageBackLink from "@/components/ui/PageBackLink";

type Props = {
  firmId: string;
  profileId: string;
  firmName: string;
  additionalProjectFeeAmount: number;
};

const PROPERTY_TYPES = [
  { value: "", label: "Select (optional)" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "independent_house", label: "Independent house" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" },
];

const BUDGET_OPTIONS = [
  { value: "", label: "Select (optional)" },
  { value: "0-5 lakhs", label: "0–5 lakhs" },
  { value: "5-10 lakhs", label: "5–10 lakhs" },
  { value: "10-15 lakhs", label: "10–15 lakhs" },
  { value: "15-20 lakhs", label: "15–20 lakhs" },
  { value: "20-25 lakhs", label: "20–25 lakhs" },
  { value: "25-35 lakhs", label: "25–35 lakhs" },
  { value: "35+ lakhs", label: "35 lakhs+" },
];

export default function RequestProjectForm({
  firmId,
  profileId,
  firmName,
  additionalProjectFeeAmount,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<{
    title: string;
    description: string;
    property_type: string;
    carpet_area: string;
    rooms: string;
    budget_range: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitRequest(data: {
    title: string;
    description: string;
    property_type: string;
    carpet_area: string;
    rooms: string;
    budget_range: string;
  }) {
    setError(null);
    const formData = new FormData();
    formData.set("firmId", firmId);
    formData.set("title", data.title);
    formData.set("description", data.description);
    formData.set("property_type", data.property_type);
    formData.set("carpet_area", data.carpet_area);
    formData.set("rooms", data.rooms);
    formData.set("budget_range", data.budget_range);
    const result = await requestProjectAction(formData);
    if (result.ok) {
      router.push(`/customer/projects/${result.projectId}`);
      return;
    }
    if (result.error === "PROJECT_LIMIT_REACHED") {
      setPendingData(data);
      setModalOpen(true);
      return;
    }
    setError(result.error);
  }

  function getFormData(form: HTMLFormElement) {
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value?.trim() ?? "";
    return {
      title: get("title"),
      description: get("description"),
      property_type: get("property_type"),
      carpet_area: get("carpet_area"),
      rooms: get("rooms"),
      budget_range: get("budget_range"),
    };
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = e.currentTarget;
    const data = getFormData(form);
    if (!data.title) {
      setError("Project title is required.");
      setSubmitting(false);
      return;
    }
    const limit = await checkProjectLimitAction();
    if (!limit.allowed) {
      setPendingData(data);
      setModalOpen(true);
      setSubmitting(false);
      return;
    }
    await submitRequest(data);
    setSubmitting(false);
  }

  async function afterAdditionalFeePaid() {
    if (!pendingData) return;
    await submitRequest(pendingData);
    setModalOpen(false);
    setPendingData(null);
  }

  return (
    <>
      <PageBackLink href={`/designers/${profileId}`} label={firmName} />
      <div className="mb-6">
        <h1 className="heading-lg mb-1">Enter Project Details</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Describe your project for {firmName}. Your first project is included with your subscription; each additional project is ₹{additionalProjectFeeAmount.toLocaleString()}.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="card space-y-5">
        <input type="hidden" name="firmId" value={firmId} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Project title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            className="input w-full"
            placeholder="e.g. 3BHK interior design"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Project details / description</label>
          <textarea
            name="description"
            rows={4}
            className="input w-full"
            placeholder="Brief description of what you need—rooms, style, timeline, etc."
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Property type</label>
            <select name="property_type" className="input w-full">
              {PROPERTY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Budget range</label>
            <select name="budget_range" className="input w-full">
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Carpet area (sq ft)</label>
            <input
              name="carpet_area"
              type="number"
              min={0}
              className="input w-full"
              placeholder="e.g. 1200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Number of rooms</label>
            <input
              name="rooms"
              type="number"
              min={0}
              className="input w-full"
              placeholder="e.g. 3"
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn btn-primary inline-flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              "Request meetup"
            )}
          </button>
        </div>
      </form>

      <PaymentCheckoutModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingData(null);
        }}
        amountRupees={additionalProjectFeeAmount}
        title="Additional project fee"
        subtitle="Your subscription includes one project. Pay to start another project with this designer."
        kind="ADDITIONAL_PROJECT"
        mockPay={payAdditionalProjectFeeAction}
        onPaid={afterAdditionalFeePaid}
      />
    </>
  );
}
