import Link from "next/link";
import { Building2, LogIn, ShieldCheck, User } from "lucide-react";
import AuthLoginForm from "@/components/forms/AuthLoginForm";
import { getAdminSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  const settings = await getAdminSettings();
  const resolvedParams = await searchParams;
  const role =
    resolvedParams?.role === "firm"
      ? "firm"
      : resolvedParams?.role === "admin"
        ? "admin"
        : "customer";

  const isCustomer = role === "customer";
  const isFirm = role === "firm";

  return (
    <div className="bg-white min-h-screen">
      <main className="page">
        <div className="page-inner">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Info Panel */}
              <div className="card-subtle">
                <div className="flex items-center gap-2 mb-4">
                  <LogIn className="h-4 w-4 text-[var(--brand)]" />
                  <p className="eyebrow">{isFirm ? "Firm access" : "Customer access"}</p>
                </div>
                <h1 className="heading-lg mb-4">
                  {isFirm ? "Sign in to manage projects" : "Sign in to track your home"}
                </h1>
                <p className="text-[var(--text-muted)] mb-8">
                  {isFirm
                    ? "Handle leads, milestones, and approvals with clarity."
                    : "Approve milestones, view updates, and access your digital twin."}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    {isFirm ? (
                      <Building2 className="h-4 w-4 text-[var(--brand)]" />
                    ) : (
                      <User className="h-4 w-4 text-[var(--brand)]" />
                    )}
                    <span>{isFirm ? "Firm dashboard access" : "Customer dashboard access"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
                    <span>Secure sign-in with OTP option</span>
                  </div>
                </div>
              </div>

              {/* Form Panel */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  {isFirm ? <Building2 className="h-4 w-4 text-[var(--brand)]" /> : <User className="h-4 w-4 text-[var(--brand)]" />}
                  <p className="eyebrow">{isFirm ? "Firm sign in" : "Customer sign in"}</p>
                </div>
                <h2 className="heading-md mb-2">Welcome back</h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">Use your email or mobile to continue.</p>
                <div>
                  <AuthLoginForm otpEnabled={settings.otpEnabled} />
                </div>
                <p className="mt-6 text-sm text-[var(--text-muted)]">
                  New here?{" "}
                  <Link href={`/register?role=${role}`} className="text-[var(--brand)] font-semibold hover:underline">
                    Create an account
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
