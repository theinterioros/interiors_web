"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerAction } from "@/app/actions/auth";
import { useState } from "react";

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

export default function AuthRegisterForm() {
  const [state, formAction] = useFormState(registerAction, initialState);
  const [role, setRole] = useState("CUSTOMER");

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Name</label>
        <input
          type="text"
          name="name"
          required
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>
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
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Role</label>
        <select
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="CUSTOMER">Customer</option>
          <option value="DESIGNER">Designer</option>
        </select>
      </div>

      {role === "DESIGNER" && (
        <div className="rounded-lg border border-neutral-200 p-4 space-y-4">
          <p className="text-xs text-neutral-500">
            Designers are reviewed by admin before appearing publicly.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">City</label>
              <input
                type="text"
                name="city"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Pincode</label>
              <input
                type="text"
                name="pincode"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Experience (years)</label>
            <input
              type="number"
              name="experienceYears"
              min={0}
              required
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">About</label>
            <textarea
              name="about"
              required
              rows={4}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="Create account" />
    </form>
  );
}
