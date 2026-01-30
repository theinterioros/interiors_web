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
      className="w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
    >
      {pending ? "Please wait..." : label}
    </button>
  );
}

export default function AuthLoginForm({ otpEnabled }: { otpEnabled: boolean }) {
  const [state, formAction] = useActionState<{ ok: boolean; error: string }>(
    loginAction as any,
    initialState
  );
  const [otpState, otpAction] = useActionState<{ ok: boolean; error: string }>(
    requestOtpAction as any,
    initialState
  );
  const [verifyState, verifyAction] = useActionState<{ ok: boolean; error: string }>(
    verifyOtpAction as any,
    initialState
  );
  const otpRequested = otpState.ok;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Email or Mobile</label>
          <input
            type="text"
            name="identifier"
            required
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Password</label>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton label="Sign in" />
      </form>

      {otpEnabled && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-800">Login with OTP</h3>
          <p className="text-xs text-neutral-500">
            OTP login is enabled by the admin. Request a code to sign in.
          </p>
          {!otpRequested ? (
            <form action={otpAction} className="mt-3 space-y-3">
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
              {otpState.error && <p className="text-sm text-red-600">{otpState.error}</p>}
              <SubmitButton label="Send OTP" />
            </form>
          ) : (
            <form action={verifyAction} className="mt-3 space-y-3">
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
              <input
                type="text"
                name="code"
                required
                placeholder="6-digit code"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
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
