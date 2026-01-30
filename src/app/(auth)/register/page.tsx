import Link from "next/link";
import { Building2, User, UserPlus } from "lucide-react";
import AuthRegisterForm from "@/components/forms/AuthRegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  const resolvedParams = await searchParams;
  const roleParam =
    resolvedParams?.role === "firm"
      ? "FIRM"
      : resolvedParams?.role === "admin"
        ? "ADMIN"
        : "CUSTOMER";

  const isCustomer = roleParam === "CUSTOMER";
  const isFirm = roleParam === "FIRM";

  return (
    <div className="bg-white min-h-screen">
      <main className="page">
        <div className="page-inner">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Info Panel */}
              <div className="card-subtle">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="h-4 w-4 text-[var(--brand)]" />
                  <p className="eyebrow">{isFirm ? "Firm onboarding" : "Customer onboarding"}</p>
                </div>
                <h1 className="heading-lg mb-4">
                  {isFirm ? "Apply as a verified firm" : "Create your customer account"}
                </h1>
                <p className="text-[var(--text-muted)] mb-8">
                  {isFirm
                    ? "Submit firm details and get verified for customer discovery."
                    : "Track your milestones, approvals, and documents in one place."}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    {isFirm ? (
                      <Building2 className="h-4 w-4 text-[var(--brand)]" />
                    ) : (
                      <User className="h-4 w-4 text-[var(--brand)]" />
                    )}
                    <span>{isFirm ? "Firm verification flow" : "Customer dashboard access"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <UserPlus className="h-4 w-4 text-[var(--brand)]" />
                    <span>Quick setup in minutes</span>
                  </div>
                </div>
              </div>

              {/* Form Panel */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  {isFirm ? <Building2 className="h-4 w-4 text-[var(--brand)]" /> : <User className="h-4 w-4 text-[var(--brand)]" />}
                  <p className="eyebrow">
                    {roleParam === "ADMIN" ? "Admin access" : isFirm ? "Firm sign up" : "Customer sign up"}
                  </p>
                </div>
                <h2 className="heading-md mb-2">Create your account</h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  {roleParam === "ADMIN"
                    ? "Admins are invite-only. Please sign in."
                    : "Provide a few details to get started."}
                </p>
                <div>
                  {roleParam === "ADMIN" ? (
                    <Link href="/login?role=admin" className="text-[var(--brand)] font-semibold hover:underline">
                      Go to admin sign in
                    </Link>
                  ) : (
                    <AuthRegisterForm fixedRole={roleParam} />
                  )}
                </div>
                <p className="mt-6 text-sm text-[var(--text-muted)]">
                  Already have an account?{" "}
                  <Link href={`/login?role=${roleParam.toLowerCase()}`} className="text-[var(--brand)] font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
