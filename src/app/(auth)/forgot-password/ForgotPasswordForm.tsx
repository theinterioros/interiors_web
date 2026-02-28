"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  requestForgotPasswordOtpAction,
  verifyOtpAndResetPasswordAction,
} from "@/app/actions/auth";
import ValidatedEmailInput from "@/components/ui/ValidatedEmailInput";

const initialRequestState = { ok: false, error: "", sent: false, email: "" };
const initialResetState = { ok: false, error: "" };

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

export default function ForgotPasswordForm({ role }: { role: string }) {
  const [requestState, requestAction] = useActionState(
    requestForgotPasswordOtpAction as (prev: typeof initialRequestState, formData: FormData) => Promise<typeof initialRequestState>,
    initialRequestState
  );
  const [resetState, resetAction] = useActionState(
    verifyOtpAndResetPasswordAction as (prev: typeof initialResetState, formData: FormData) => Promise<typeof initialResetState>,
    initialResetState
  );

  const step2 = requestState.ok && requestState.sent && requestState.email;

  return (
    <div className="space-y-6">
      {!step2 ? (
        <>
          <p className="text-sm text-[var(--text-muted)]">
            Enter your email. If an account exists, we’ll send a verification code to reset your password.
          </p>
          <form action={requestAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
              <ValidatedEmailInput name="email" placeholder="you@example.com" className="input w-full" />
            </div>
            {requestState.error && <p className="text-sm text-red-600">{requestState.error}</p>}
            <SubmitButton label="Send verification code" />
          </form>
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--text-muted)]">
            We sent a 6-digit code to <strong>{requestState.email}</strong>. Enter it below and set a new password.
          </p>
          <form action={resetAction} className="space-y-4">
            <input type="hidden" name="email" value={requestState.email} />
            <input type="hidden" name="role" value={role} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Verification code</label>
              <input
                type="text"
                name="code"
                required
                className="input"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">New password</label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={8}
                className="input"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                className="input"
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </div>
            {resetState.error && <p className="text-sm text-red-600">{resetState.error}</p>}
            <SubmitButton label="Reset password" />
          </form>
        </>
      )}
      <p className="text-sm text-[var(--text-muted)]">
        <Link href={role ? `/login?role=${role === "firm" ? "designer" : role}` : "/login"} className="font-medium text-[var(--brand)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
