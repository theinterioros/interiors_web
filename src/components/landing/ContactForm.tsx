"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { contactAction, type ContactState } from "@/app/actions/contact";
import { CheckCircle2, User, Users } from "lucide-react";

const initialState: ContactState = { ok: false, error: "" };

const inputClass =
  "w-full bg-transparent px-0 py-3 text-white placeholder:text-slate-400 text-sm border-0 border-b border-slate-600 focus:border-[var(--brand)] focus:outline-none focus:ring-0 transition-colors";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-4 px-5 rounded-xl font-semibold text-sm text-slate-900 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 mt-2"
    >
      {pending ? "Sending…" : "Get in touch"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(contactAction, initialState);

  if (state.ok) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="flex justify-center mb-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)]/20 text-[var(--brand)]">
            <CheckCircle2 className="h-6 w-6" />
          </span>
        </div>
        <p className="font-semibold text-white mb-1">Thank you</p>
        <p className="text-sm text-slate-400">
          We’ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="firstName"
            required
            placeholder="First name"
            className={inputClass}
          />
        </div>
        <div>
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <input
          type="email"
          name="email"
          required
          placeholder="Work email"
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div>
        <input
          type="tel"
          name="phone"
          required
          placeholder="+91 (000) 000-0000"
          inputMode="numeric"
          minLength={10}
          maxLength={14}
          className={inputClass}
        />
      </div>

      <div className="pt-2">
        <p className="text-sm font-medium text-white mb-3">I am</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative flex cursor-pointer flex-col rounded-xl border border-slate-600 bg-white/5 p-4 transition-colors has-[:checked]:border-[var(--brand)] has-[:checked]:bg-[var(--brand)]/10">
            <input type="radio" name="inquiryType" value="homeowner" className="sr-only peer" defaultChecked />
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              <User className="h-4 w-4 text-slate-400" />
              Homeowner
            </span>
            <span className="mt-1 text-xs text-slate-400">I need help with my home project.</span>
          </label>
          <label className="relative flex cursor-pointer flex-col rounded-xl border border-slate-600 bg-white/5 p-4 transition-colors has-[:checked]:border-[var(--brand)] has-[:checked]:bg-[var(--brand)]/10">
            <input type="radio" name="inquiryType" value="firm" className="sr-only peer" />
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              <Users className="h-4 w-4 text-slate-400" />
              Interior firm
            </span>
            <span className="mt-1 text-xs text-slate-400">I want to list my firm.</span>
          </label>
        </div>
      </div>

      <div>
        <textarea
          name="message"
          placeholder="Message (optional)"
          rows={2}
          className={`${inputClass} resize-none border-b`}
        />
      </div>

      {state.error && (
        <p className="text-sm text-[var(--brand)] bg-[var(--brand)]/10 px-3 py-2 rounded-lg border border-[var(--brand)]/20">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
