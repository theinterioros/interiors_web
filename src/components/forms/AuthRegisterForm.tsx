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
      className="w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "Please wait..." : label}
    </button>
  );
}

export default function AuthRegisterForm({ fixedRole }: { fixedRole?: "CUSTOMER" | "FIRM" }) {
  const [state, formAction] = useActionState<{ ok: boolean; error: string }>(
    registerAction as any,
    initialState
  );
  const [role, setRole] = useState(fixedRole ?? "CUSTOMER");


  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          {role === "FIRM" ? "Contact person name" : "Name"}
        </label>
        <input
          type="text"
          name="name"
          required
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Mobile number</label>
        <input
          type="tel"
          name="phone"
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
      {role === "CUSTOMER" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">OTP (email)</label>
          <input
            type="text"
            name="otp"
            placeholder="Optional — verify after signup"
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
      )}
      {fixedRole ? (
        <input type="hidden" name="role" value={fixedRole} />
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Role</label>
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as "CUSTOMER" | "FIRM")}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="FIRM">Interior firm</option>
          </select>
        </div>
      )}

      {role === "FIRM" && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-4">
          <p className="text-xs text-neutral-500">
            Firms are reviewed by admin before appearing publicly.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Firm name</label>
            <input
              type="text"
              name="firmName"
              required
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Owner name</label>
              <input
                type="text"
                name="ownerName"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Alternate mobile</label>
              <input
                type="tel"
                name="altPhone"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
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
            <label className="text-sm font-medium text-neutral-700">Office address</label>
            <input
              type="text"
              name="officeAddress"
              required
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Portfolio attachment</label>
            <input
              type="file"
              name="portfolio"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
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
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Business type</label>
              <select
                name="businessType"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
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
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Ticket size</label>
              <select
                name="ticketSize"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
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
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Comments</label>
            <textarea
              name="comments"
              rows={3}
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
