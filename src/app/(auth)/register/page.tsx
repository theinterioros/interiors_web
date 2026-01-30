import Link from "next/link";
import { Building2, Home, User, UserPlus } from "lucide-react";
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
    <div className={`min-h-screen -mt-[var(--header-height)] pt-[var(--header-height)] ${isCustomer ? "bg-gradient-to-br from-[var(--brand-light)]/30 to-white" : "bg-gradient-to-br from-slate-50 to-white"}`}>
      <main className="page">
        <div className="page-inner">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Info Panel — distinct for customer vs firm */}
              <div
                className={
                  isCustomer
                    ? "rounded-2xl border border-[var(--border)] bg-white/80 p-8 shadow-sm backdrop-blur"
                    : "rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-8"
                }
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${isCustomer ? "bg-[var(--brand-light)] text-[var(--brand)]" : "bg-slate-200 text-slate-600"}`}>
                  {isFirm ? <Building2 className="h-7 w-7" /> : <Home className="h-7 w-7" />}
                </div>
                <p className="eyebrow mb-2">{isFirm ? "Interior firm" : "Homeowner"}</p>
                <h1 className="heading-lg mb-4">
                  {isFirm ? "Apply as a verified firm" : "Create your account"}
                </h1>
                <p className="text-[var(--text-muted)] mb-6">
                  {isFirm
                    ? "Submit your firm details. After admin approval, you’ll appear in the verified list."
                    : "One account to estimate costs, choose a firm, and track your project."}
                </p>
                <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                  {isFirm ? (
                    <>
                      <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500" /> Verification by Interior OS</li>
                      <li className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-slate-500" /> Quick application</li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2"><User className="h-4 w-4 text-[var(--brand)]" /> Dashboard access</li>
                      <li className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-[var(--brand)]" /> Setup in minutes</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Form Panel */}
              <div className={isFirm ? "rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm" : "card rounded-2xl p-8"}>
                <div className="flex items-center gap-2 mb-4">
                  {isFirm ? <Building2 className="h-4 w-4 text-slate-600" /> : <User className="h-4 w-4 text-[var(--brand)]" />}
                  <p className="eyebrow">{roleParam === "ADMIN" ? "Admin" : isFirm ? "Firm sign up" : "Customer sign up"}</p>
                </div>
                <h2 className="heading-md mb-2">Create your account</h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  {roleParam === "ADMIN"
                    ? "Admins are invite-only. Sign in with your admin credentials."
                    : "Enter your details to get started."}
                </p>
                <div>
                  {roleParam === "ADMIN" ? (
                    <Link href="/login?role=admin" className="font-semibold text-[var(--brand)] hover:underline">
                      Go to admin sign in
                    </Link>
                  ) : (
                    <AuthRegisterForm fixedRole={roleParam} />
                  )}
                </div>
                <p className="mt-6 text-sm text-[var(--text-muted)]">
                  Already have an account?{" "}
                  <Link href={`/login?role=${roleParam.toLowerCase()}`} className="font-semibold text-[var(--brand)] hover:underline">
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
