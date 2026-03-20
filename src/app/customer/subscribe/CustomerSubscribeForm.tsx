"use client";

import { useRouter } from "next/navigation";
// Customer registration/subscription is free now.

export default function CustomerSubscribeForm({ amount }: { amount: number }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-primary w-full"
      onClick={() => router.push("/customer/dashboard")}
      disabled={amount !== 0}
      title={amount === 0 ? undefined : "Registration is free now."}
    >
      Go to dashboard
    </button>
  );
}
