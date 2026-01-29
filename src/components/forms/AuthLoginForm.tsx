"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, requestOtpAction, verifyOtpAction } from "@/app/actions/auth";
import { useEffect, useState } from "react";

const initialState = { ok: false as boolean, error: "" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "Please wait..." : label}
    </button>
  );
}

export default function AuthLoginForm({ otpEnabled }: { otpEnabled: boolean }) {
  const [state, formAction] = useFormState(loginAction, initialState);
  const [otpState, otpAction] = useFormState(requestOtpAction, initialState);
  const [verifyState, verifyAction] = useFormState(verifyOtpAction, initialState);
  const [otpRequested, setOtpRequested] = useState(false);

  useEffect(() => {
    if (otpState.ok) {
      setOtpRequested(true);
    }
  }, [otpState.ok]);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Email</label>
          <input
            type="email"
            name="email"
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
        <div className="rounded-lg border border-neutral-200 p-4">
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
