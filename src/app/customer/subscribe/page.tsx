import Link from "next/link";
import { User, IndianRupee } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasCustomerPaidSubscription } from "@/lib/registrationPayments";
import { redirect } from "next/navigation";
import CustomerSubscribeForm from "./CustomerSubscribeForm";
import { CUSTOMER_SUBSCRIPTION_AMOUNT } from "@/lib/registrationPayments";

export const dynamic = "force-dynamic";

export default async function CustomerSubscribePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect("/login?role=customer");
  }
  const paid = await hasCustomerPaidSubscription(user.id);
  if (paid) {
    redirect("/customer/dashboard");
  }

  return (
    <div className="page">
      <div className="page-inner">
        <div className="mx-auto max-w-md">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="eyebrow">Customer subscription</p>
                <h1 className="heading-md">Unlock your dashboard</h1>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Pay the one-time subscription fee to access the AI estimator, browse verified firms, start projects, and manage your digital twin.
            </p>
            <div className="flex items-baseline gap-2 mb-6">
              <IndianRupee className="h-6 w-6 text-[var(--foreground)]" />
              <span className="text-3xl font-bold text-[var(--foreground)]">{CUSTOMER_SUBSCRIPTION_AMOUNT.toLocaleString()}</span>
              <span className="text-[var(--text-muted)]">one-time</span>
            </div>
            <CustomerSubscribeForm amount={CUSTOMER_SUBSCRIPTION_AMOUNT} />
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              <Link href="/login?role=customer" className="font-medium text-[var(--brand)] hover:underline">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
