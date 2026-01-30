"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { contactAction, type ContactState } from "@/app/actions/contact";

const initialState: ContactState = { ok: false, error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary w-full py-2.5 text-sm font-semibold rounded-lg disabled:opacity-50"
    >
      {pending ? "Sending..." : "Request a call"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(contactAction, initialState);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand-light)]/50 p-4 text-sm text-[var(--foreground)]">
        <p className="font-semibold text-[var(--brand)]">Thank you.</p>
        <p>We’ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Name</label>
          <input type="text" name="name" required placeholder="Your name" className="input input-premium text-sm py-2.5" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Email</label>
          <input type="email" name="email" required placeholder="you@example.com" className="input input-premium text-sm py-2.5" autoComplete="email" title="Enter a valid email address" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Phone</label>
        <input type="tel" name="phone" required placeholder="10-digit mobile" className="input input-premium text-sm py-2.5" inputMode="numeric" minLength={10} maxLength={14} title="Enter 10-digit Indian mobile number" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Message</label>
        <textarea name="message" placeholder="Brief note about your project" rows={2} className="input input-premium resize-none text-sm py-2.5" />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
