"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, requestOtpAction, verifyOtpAction } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";
import ValidatedEmailInput from "@/components/ui/ValidatedEmailInput";

const initialState = { ok: false as boolean, error: "" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex cursor-pointer items-center justify-center gap-2 w-full rounded-lg border border-transparent bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-wait"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Please wait...
        </>
      ) : (
        label
      )}
    </button>
  );
}

const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  firm: "Designer",
  admin: "Admin",
};

export default function AuthLoginForm({
  role,
  otpEnabled,
  isDesigner,
}: {
  role: "customer" | "firm" | "admin";
  otpEnabled: boolean;
  isDesigner?: boolean;
}) {
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
        <input type="hidden" name="intendedRole" value={role} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
          <ValidatedEmailInput name="email" placeholder="you@example.com" className="input w-full" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Password</label>
          <input
            type="password"
            name="password"
            required
            autoComplete={role === "customer" ? "off" : "current-password"}
            className="input w-full"
          />
        </div>
        {state.error && (
          <p className="text-sm text-red-600 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2" role="alert">
            {state.error}
          </p>
        )}
        <SubmitButton label={`Sign in as ${ROLE_LABELS[role] ?? role}`} />
      </form>

      {otpEnabled && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Sign in with OTP</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Request a one-time code to your email.
          </p>
          {!otpRequested ? (
            <form action={otpAction} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
                <ValidatedEmailInput name="email" placeholder="Email" className="input w-full" />
              </div>
              {otpState.error && <p className="text-sm text-red-600">{otpState.error}</p>}
              <SubmitButton label="Send OTP" />
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
                className="input w-full"
              />
              {verifyState.error && <p className="text-sm text-red-600">{verifyState.error}</p>}
              <SubmitButton label="Verify and sign in" />
            </form>
          )}
        </div>
      )}
    </div>
  );
}
