"use client";

import { useFormStatus } from "react-dom";
import { payCustomerSubscriptionAction } from "@/app/actions/auth";

function SubmitButton({ amount }: { amount: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary w-full disabled:opacity-50"
    >
      {pending ? "Processing…" : `Pay ₹${amount.toLocaleString()} (mock payment)`}
    </button>
  );
}

export default function CustomerSubscribeForm({ amount }: { amount: number }) {
  return (
    <form action={payCustomerSubscriptionAction}>
      <SubmitButton amount={amount} />
    </form>
  );
}
