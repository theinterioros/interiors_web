import Link from "next/link";
import { Cuboid, IndianRupee } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getAdminSettings } from "@/lib/settings";
import CustomerRenewForm from "./CustomerRenewForm";

export const dynamic = "force-dynamic";

export default async function CustomerRenewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect("/login?role=customer");
  }

  const settings = await getAdminSettings();
  const amount = settings.digitalTwinYearlyFee ?? 1000;

  const [subscription] = await sql<{ expires_at: Date }>`
    select expires_at from digital_twin_subscriptions where customer_id = ${user.id} limit 1
  `;
  const expiresAt = subscription ? new Date(subscription.expires_at) : null;
  const isActive = expiresAt ? expiresAt > new Date() : false;
  const neverSubscribed = !subscription;

  return (
    <div className="page">
      <div className="page-inner">
        <div className="mx-auto max-w-md">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
                <Cuboid className="h-6 w-6" />
              </div>
              <div>
                <p className="eyebrow">Digital Twin</p>
                <h1 className="heading-md">
                  {neverSubscribed ? "Subscribe to Digital Twin" : isActive ? "Renew subscription" : "Subscription expired"}
                </h1>
              </div>
            </div>
            {neverSubscribed ? (
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Subscribe to upload and organise project files in one place. View designer deliverables and your uploads per project.
              </p>
            ) : isActive ? (
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Your Digital Twin is active until <strong>{expiresAt?.toLocaleDateString()}</strong>. Renew now to add one more year.
              </p>
            ) : (
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Your Digital Twin subscription has expired. Renew to keep uploading and viewing project files in one place.
              </p>
            )}
            <div className="flex items-baseline gap-2 mb-6">
              <IndianRupee className="h-6 w-6 text-[var(--foreground)]" />
              <span className="text-3xl font-bold text-[var(--foreground)]">₹{amount.toLocaleString()}</span>
              <span className="text-[var(--text-muted)]">/ year</span>
            </div>
            <CustomerRenewForm />
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              <Link href="/customer/digital-twin" className="font-medium text-[var(--brand)] hover:underline">
                Back to Digital Twin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
