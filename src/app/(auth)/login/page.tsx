import Link from "next/link";
import { Building2, Home, ShieldCheck, User } from "lucide-react";
import AuthLoginForm from "@/components/forms/AuthLoginForm";
import { getAdminSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string; reset?: string }>;
}) {
  const settings = await getAdminSettings();
  const resolvedParams = await searchParams;
  const resetSuccess = resolvedParams?.reset === "1";
  const role =
    resolvedParams?.role === "firm"
      ? "firm"
      : resolvedParams?.role === "admin"
        ? "admin"
        : "customer";

  const isCustomer = role === "customer";
  const isFirm = role === "firm";
  const isAdmin = role === "admin";

  return (
    <div
      className={`min-h-screen flex flex-col justify-center ${
        isCustomer
          ? "bg-gradient-to-br from-[var(--brand-light)]/30 to-white"
          : isFirm
            ? "bg-gradient-to-br from-teal-50 via-slate-50 to-white"
            : "bg-white"
      }`}
    >
      <main className="page flex-1 flex flex-col justify-center py-8">
        <div className="page-inner">
          <div className="mx-auto max-w-5xl">
            <div className={`grid gap-12 lg:grid-cols-2 ${isFirm ? "lg:flex-row-reverse" : ""}`}>
              {/* Info Panel — distinct per role */}
              <div
                className={
                  isCustomer
                    ? "rounded-2xl border border-[var(--border)] bg-white/80 p-8 shadow-sm backdrop-blur"
                    : isFirm
                      ? "rounded-2xl border-2 border-teal-200 bg-white/90 p-8 shadow-md"
                      : "card-subtle rounded-2xl p-8"
                }
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    isAdmin ? "bg-[var(--brand-light)] text-[var(--brand)]" : isFirm ? "bg-teal-100 text-teal-700" : "bg-[var(--brand-light)] text-[var(--brand)]"
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="h-7 w-7" /> : isFirm ? <Building2 className="h-7 w-7" /> : <Home className="h-7 w-7" />}
                </div>
                <p className={`eyebrow mb-2 ${isFirm ? "text-teal-600" : ""}`}>{isAdmin ? "Admin" : isFirm ? "Designer / Studio" : "Homeowner"}</p>
                <h1 className="heading-lg mb-4">
                  {isAdmin
                    ? "Admin sign in"
                    : isFirm
                      ? "Sign in to your studio"
                      : "Sign in to your home journey"}
                </h1>
                <p className="text-[var(--text-muted)] mb-6">
                  {isAdmin
                    ? "Access the admin dashboard to manage users, firms, and payments."
                    : isFirm
                      ? "Manage leads, milestones, and project approvals from one place."
                      : "Track milestones, approve updates, and access your digital twin."}
                </p>
                <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                  {isAdmin ? (
                    <>
                      <li className="flex items-center gap-2">User & firm management</li>
                      <li className="flex items-center gap-2">Payment controls</li>
                      <li className="flex items-center gap-2">Settings & pricing</li>
                    </>
                  ) : isFirm ? (
                    <>
                      <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-teal-600" /> Firm dashboard</li>
                      <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-600" /> Secure sign-in</li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2"><User className="h-4 w-4 text-[var(--brand)]" /> Customer dashboard</li>
                      <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--brand)]" /> OTP option available</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Form Panel — designer theme uses teal/slate accents */}
              <div
                className={
                  isFirm
                    ? "rounded-2xl border-2 border-teal-200 bg-white p-8 shadow-md"
                    : "card rounded-2xl p-8"
                }
              >
                <div className="flex items-center gap-2 mb-4">
                  {isFirm ? <Building2 className="h-4 w-4 text-teal-600" /> : <User className="h-4 w-4 text-[var(--brand)]" />}
                  <p className={isFirm ? "eyebrow text-teal-600" : "eyebrow"}>{isAdmin ? "Admin sign in" : isFirm ? "Designer sign in" : "Customer sign in"}</p>
                </div>
                <h2 className="heading-md mb-2">Welcome back</h2>
                {resetSuccess && (
                  <p className="text-sm text-green-600 font-medium mb-4 rounded-lg bg-green-50 dark:bg-green-950/30 px-3 py-2 border border-green-200 dark:border-green-800">
                    Password reset successfully. Sign in with your new password.
                  </p>
                )}
                <p className="text-sm text-[var(--text-muted)] mb-6">Enter your email and password to continue.</p>
                <div>
                  <AuthLoginForm otpEnabled={settings.otpEnabled} isDesigner={isFirm} />
                </div>
                <p className="mt-4 text-sm text-[var(--text-muted)]">
                  <Link
                    href={role ? `/forgot-password?role=${role}` : "/forgot-password"}
                    className={isFirm ? "font-medium text-teal-600 hover:text-teal-700 hover:underline" : "font-medium text-[var(--brand)] hover:underline"}
                  >
                    Forgot password?
                  </Link>
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  New here?{" "}
                  <Link
                    href={`/register?role=${role}`}
                    className={isFirm ? "font-semibold text-teal-600 hover:text-teal-700 hover:underline" : "font-semibold text-[var(--brand)] hover:underline"}
                  >
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
