"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction } from "@/app/actions/auth";
import { useState } from "react";

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

export default function AuthRegisterForm({ fixedRole }: { fixedRole?: "CUSTOMER" | "FIRM" }) {
  const [state, formAction] = useActionState<{ ok: boolean; error: string }, FormData>(
    registerAction as (prev: { ok: boolean; error: string }, formData: FormData) => Promise<{ ok: boolean; error: string }>,
    initialState
  );
  const [role, setRole] = useState(fixedRole ?? "CUSTOMER");


  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {role === "FIRM" ? "Contact person name" : "Name"}
        </label>
        <input
          type="text"
          name="name"
          required
          className="input"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">
          Mobile number {role === "FIRM" ? "(required)" : "(optional)"}
        </label>
        <input
          type="tel"
          name="phone"
          required={role === "FIRM"}
          className="input"
          inputMode="numeric"
          minLength={10}
          maxLength={14}
          placeholder="10-digit mobile"
          title="Enter 10-digit Indian mobile number (e.g. 9876543210)"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
        <input
          type="email"
          name="email"
          required
          className="input"
          autoComplete="email"
          placeholder="you@example.com"
          title="Enter a valid email address"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">Password</label>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          className="input"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">Confirm password</label>
        <input
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          className="input"
        />
      </div>
      {fixedRole ? (
        <input type="hidden" name="role" value={fixedRole} />
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Role</label>
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as "CUSTOMER" | "FIRM")}
            className="input"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="FIRM">Interior firm</option>
          </select>
        </div>
      )}

      {role === "FIRM" && (
        <div className="card-subtle space-y-4">
          <p className="text-xs text-neutral-500">
            Firms are reviewed by admin before appearing publicly.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Firm name</label>
            <input
              type="text"
              name="firmName"
              required
              className="input"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Owner name</label>
              <input
                type="text"
                name="ownerName"
                required
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Alternate mobile</label>
              <input
                type="tel"
                name="altPhone"
                className="input"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">City</label>
              <input
                type="text"
                name="city"
                required
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Pincode</label>
              <input
                type="text"
                name="pincode"
                required
                className="input"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Office address</label>
            <input
              type="text"
              name="officeAddress"
              required
              className="input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Portfolio attachment</label>
            <input
              type="file"
              name="portfolio"
              className="input"
            />
            <p className="text-xs text-neutral-500">
              You can upload additional documents after signup in your dashboard.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">GST number</label>
              <input
                type="text"
                name="gst"
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Business type</label>
              <select
                name="businessType"
                className="input"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Experience (years)</label>
            <input
              type="number"
              name="experienceYears"
              min={0}
              required
              className="input"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Ticket size</label>
              <select
                name="ticketSize"
                className="input"
              >
                <option value="0-5 lakhs">0-5 lakhs</option>
                <option value="5-10 lakhs">5-10 lakhs</option>
                <option value="10-15 lakhs">10-15 lakhs</option>
                <option value="15-20 lakhs">15-20 lakhs</option>
                <option value="20-25 lakhs">20-25 lakhs</option>
                <option value="25-35 lakhs">25-35 lakhs</option>
                <option value="35+ lakhs">35 lakhs and above</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Designers in team</label>
              <input
                type="number"
                name="designersCount"
                min={0}
                className="input"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">About</label>
            <textarea
              name="about"
              required
              rows={4}
              className="input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Comments</label>
            <textarea
              name="comments"
              rows={3}
              className="input"
            />
          </div>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="Create account" />
    </form>
  );
}
