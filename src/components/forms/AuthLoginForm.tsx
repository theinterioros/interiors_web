"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, requestOtpAction, verifyOtpAction } from "@/app/actions/auth";

const initialState = { ok: false as boolean, error: "" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary w-full disabled:opacity-50"
    >
      {pending ? "Please wait..." : label}
    </button>
  );
}

export default function AuthLoginForm({ otpEnabled }: { otpEnabled: boolean }) {
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
          <input
            type="text"
            name="identifier"
            required
            className="input"
            autoComplete="username"
            placeholder="Email or 10-digit mobile"
            title="Enter your email or 10-digit Indian mobile number"
          />
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
        <SubmitButton label="Sign in" />
      </form>

      {otpEnabled && (
        <div className="card-subtle">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Login with OTP</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            OTP login is enabled by the admin. Request a code to sign in.
          </p>
          {!otpRequested ? (
            <form action={otpAction} className="space-y-3">
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                className="input"
              />
              {otpState.error && <p className="text-sm text-red-600">{otpState.error}</p>}
              <SubmitButton label="Send OTP" />
            </form>
          ) : (
            <form action={verifyAction} className="space-y-3">
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                className="input"
              />
              <input
                type="text"
                name="code"
                required
                placeholder="6-digit code"
                className="input"
              />
              {verifyState.error && <p className="text-sm text-red-600">{verifyState.error}</p>}
              <SubmitButton label="Verify & Sign in" />
            </form>
          )}
        </div>
      )}
    </div>
  );
}
