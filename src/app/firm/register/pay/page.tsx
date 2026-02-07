import Link from "next/link";
import { Building2, IndianRupee, LayoutDashboard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasFirmPaidRegistration } from "@/lib/registrationPayments";
import { redirect } from "next/navigation";
import FirmRegisterPayForm from "./FirmRegisterPayForm";
import { FIRM_REGISTRATION_AMOUNT } from "@/lib/registrationPayments";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FirmRegisterPayPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FIRM") {
    redirect("/login?role=firm");
  }
  const paid = await hasFirmPaidRegistration(user.id);
  if (paid) {
    redirect("/firm/dashboard");
  }
  const [profile] = await sql<{ margin_accepted_at: Date | null }>`
    select margin_accepted_at from firm_profiles where user_id = ${user.id} limit 1
  `;
  if (profile?.margin_accepted_at == null) {
    return (
      <div className="page">
        <div className="page-inner">
          <div className="mx-auto max-w-md">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                  <p className="eyebrow">Complete margin step first</p>
                  <h1 className="heading-md">Accept platform margin on your dashboard</h1>
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Before paying the registration fee, declare your margin (if needed), get admin approval, and accept the margin from your dashboard.
              </p>
              <Link href="/firm/dashboard" className="btn btn-primary inline-flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <h1 className="heading-md">Subscribe to access the platform</h1>
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Pay the yearly subscription (₹3,000/year) to access your designer dashboard, accept leads, and manage projects. Renew each year to stay active.
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <IndianRupee className="h-6 w-6 text-[var(--foreground)]" />
                <span className="text-3xl font-bold text-[var(--foreground)]">{FIRM_REGISTRATION_AMOUNT.toLocaleString()}</span>
                <span className="text-[var(--text-muted)]">/ year</span>
              </div>
              <FirmRegisterPayForm />
              <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                <Link href="/login?role=designer" className="font-medium text-[var(--brand)] hover:underline">
                  Back to sign in
                </Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
