"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestProjectAction } from "@/app/actions/project";
type Props = {
  firmId: string;
};

export default function RequestMeetupForm({ firmId }: Props) {
  const router = useRouter();
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
    await submitRequest(title, description);
    setSubmitting(false);
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
    </>
  );
}
