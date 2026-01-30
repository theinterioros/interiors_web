"use client";

import { useFormStatus } from "react-dom";
import { payFirmRegistrationAction } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary w-full disabled:opacity-50"
    >
      {pending ? "Processing…" : "Pay ₹3,000 (mock payment)"}
    </button>
  );
}

export default function FirmRegisterPayForm() {
  return (
    <form action={payFirmRegistrationAction}>
      <SubmitButton />
    </form>
  );
}
