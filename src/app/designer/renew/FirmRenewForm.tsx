"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { renewFirmSubscriptionAction } from "@/app/actions/auth";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary w-full disabled:opacity-50 inline-flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Processing…
        </>
      ) : (
        "Pay ₹3,000 (mock) — extend by 1 year"
      )}
    </button>
  );
}

export default function FirmRenewForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleAction = async (_formData: FormData): Promise<void> => {
    setError("");
    const result = await renewFirmSubscriptionAction();
    if (result?.redirect) {
      router.push(result.redirect);
      return;
    }
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <form action={handleAction}>
      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
