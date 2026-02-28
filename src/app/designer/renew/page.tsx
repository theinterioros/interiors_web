import Link from "next/link";
import { Building2, IndianRupee } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { FIRM_REGISTRATION_AMOUNT } from "@/lib/registrationPayments";
import FirmRenewForm from "./FirmRenewForm";

export const dynamic = "force-dynamic";

export default async function DesignerRenewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FIRM") {
    redirect("/login?role=designer");
  }

  const [profile] = await sql<{ subscription_expires_at: Date | null }>`
    select subscription_expires_at from firm_profiles where user_id = ${user.id} limit 1
  `;
  const expiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const isActive = expiresAt ? expiresAt > new Date() : false;
  const neverPaid = !expiresAt;

  return (
    <div className="page">
      <div className="page-inner">
        <div className="mx-auto max-w-md">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="eyebrow">Designer subscription</p>
                <h1 className="heading-md">
                  {neverPaid ? "Subscribe to access" : isActive ? "Renew subscription" : "Subscription expired"}
                </h1>
              </div>
            </div>
            {neverPaid ? (
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Pay the yearly subscription to access your dashboard, get listed, and receive leads from customers.
              </p>
            ) : isActive ? (
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Your subscription is active until <strong>{expiresAt?.toLocaleDateString()}</strong>. You can renew now to add one more year from your current expiry.
              </p>
            ) : (
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Your listing has expired. Renew to stay visible to customers and continue receiving leads.
              </p>
            )}
            <div className="flex items-baseline gap-2 mb-6">
              <IndianRupee className="h-6 w-6 text-[var(--foreground)]" />
              <span className="text-3xl font-bold text-[var(--foreground)]">{FIRM_REGISTRATION_AMOUNT.toLocaleString()}</span>
              <span className="text-[var(--text-muted)]">/ year</span>
            </div>
            <FirmRenewForm />
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              <Link href="/designer/profile" className="font-medium text-[var(--brand)] hover:underline">
                Back to profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
