import Link from "next/link";
import { User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerSubscribeForm from "./CustomerSubscribeForm";

export const dynamic = "force-dynamic";

export default async function CustomerSubscribePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect("/login?role=customer");
  }
  // Customer registration/subscription is free now.
  // Keep this page as a safe redirect target for any legacy links.
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
                <p className="eyebrow">Customer registration</p>
                <h1 className="heading-md">Unlocked</h1>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Registration is free. You already have full access to the platform.
            </p>
            <CustomerSubscribeForm amount={0} />
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              <Link href="/customer/dashboard" className="font-medium text-[var(--brand)] hover:underline">
                Go to dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
