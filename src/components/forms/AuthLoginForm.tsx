"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, requestOtpAction, verifyOtpAction } from "@/app/actions/auth";
import ValidatedIdentifierInput from "@/components/ui/ValidatedIdentifierInput";
import ValidatedEmailInput from "@/components/ui/ValidatedEmailInput";

const initialState = { ok: false as boolean, error: "" };

function SubmitButton({ label, isDesigner }: { label: string; isDesigner?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        isDesigner
          ? "btn w-full disabled:opacity-50 rounded-lg px-4 py-2.5 font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          : "btn btn-primary w-full disabled:opacity-50"
      }
    >
      {pending ? "Please wait..." : label}
    </button>
  );
}

export default function AuthLoginForm({ otpEnabled, isDesigner }: { otpEnabled: boolean; isDesigner?: boolean }) {
  const [state, formAction] = useActionState<{ ok: boolean; error: string }, FormData>(
    loginAction as (prev: { ok: boolean; error: string }, formData: FormData) => Promise<{ ok: boolean; error: string }>,
    initialState
  );
  const [otpState, otpAction] = useActionState<{ ok: boolean; error: string }, FormData>(
    requestOtpAction as (prev: { ok: boolean; error: string }, formData: FormData) => Promise<{ ok: boolean; error: string }>,
    initialState
  );
  const [verifyState, verifyAction] = useActionState<{ ok: boolean; error: string }, FormData>(
    verifyOtpAction as (prev: { ok: boolean; error: string }, formData: FormData) => Promise<{ ok: boolean; error: string }>,
    initialState
  );
  const otpRequested = otpState.ok;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Email or Mobile</label>
          <ValidatedIdentifierInput name="identifier" className="input w-full" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Password</label>
          <input
            type="password"
            name="password"
            required
            className="input"
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton label="Sign in" isDesigner={isDesigner} />
      </form>

      {otpEnabled && (
        <div className={isDesigner ? "rounded-xl border-2 border-teal-100 bg-teal-50/50 p-4" : "card-subtle"}>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Login with OTP</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            OTP login is enabled by the admin. Request a code to sign in.
          </p>
          {!otpRequested ? (
            <form action={otpAction} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
                <ValidatedEmailInput name="email" placeholder="Email" className="input w-full" />
              </div>
              {otpState.error && <p className="text-sm text-red-600">{otpState.error}</p>}
              <SubmitButton label="Send OTP" isDesigner={isDesigner} />
            </form>
          ) : (
            <form action={verifyAction} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
                <ValidatedEmailInput name="email" placeholder="Email" className="input w-full" />
              </div>
              <input
                type="text"
                name="code"
                required
                placeholder="6-digit code"
                className="input"
              />
              {verifyState.error && <p className="text-sm text-red-600">{verifyState.error}</p>}
              <SubmitButton label="Verify & Sign in" isDesigner={isDesigner} />
            </form>
          )}
        </div>
      )}
    </div>
  );
}
