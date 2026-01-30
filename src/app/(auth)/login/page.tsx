import Link from "next/link";
import { Building2, Home, ShieldCheck, User } from "lucide-react";
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
  const isAdmin = role === "admin";

  return (
    <div className={`min-h-screen -mt-[var(--header-height)] pt-[var(--header-height)] ${isCustomer ? "bg-gradient-to-br from-[var(--brand-light)]/30 to-white" : isFirm ? "bg-gradient-to-br from-slate-50 to-white" : "bg-white"}`}>
      <main className="page">
        <div className="page-inner">
          <div className="mx-auto max-w-5xl">
            <div className={`grid gap-12 lg:grid-cols-2 ${isFirm ? "lg:flex-row-reverse" : ""}`}>
              {/* Info Panel — distinct per role */}
              <div
                className={
                  isCustomer
                    ? "rounded-2xl border border-[var(--border)] bg-white/80 p-8 shadow-sm backdrop-blur"
                    : isFirm
                      ? "rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-8"
                      : "card-subtle rounded-2xl p-8"
                }
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-light)] text-[var(--brand)]">
                  {isAdmin ? <ShieldCheck className="h-7 w-7" /> : isFirm ? <Building2 className="h-7 w-7" /> : <Home className="h-7 w-7" />}
                </div>
                <p className="eyebrow mb-2">{isAdmin ? "Admin" : isFirm ? "Interior firm" : "Homeowner"}</p>
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
                      <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-[var(--brand)]" /> Firm dashboard</li>
                      <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--brand)]" /> Secure sign-in</li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2"><User className="h-4 w-4 text-[var(--brand)]" /> Customer dashboard</li>
                      <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--brand)]" /> OTP option available</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Form Panel */}
              <div className={isFirm ? "rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm" : "card rounded-2xl p-8"}>
                <div className="flex items-center gap-2 mb-4">
                  {isFirm ? <Building2 className="h-4 w-4 text-slate-600" /> : <User className="h-4 w-4 text-[var(--brand)]" />}
                  <p className="eyebrow">{isAdmin ? "Admin sign in" : isFirm ? "Firm sign in" : "Customer sign in"}</p>
                </div>
                <h2 className="heading-md mb-2">Welcome back</h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">Enter your email and password to continue.</p>
                <div>
                  <AuthLoginForm otpEnabled={settings.otpEnabled} />
                </div>
                <p className="mt-6 text-sm text-[var(--text-muted)]">
                  New here?{" "}
                  <Link href={`/register?role=${role}`} className="font-semibold text-[var(--brand)] hover:underline">
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
