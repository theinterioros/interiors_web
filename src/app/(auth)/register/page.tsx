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
    <div className="bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-900 text-sm font-semibold text-white shadow-sm">
              IO
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-900">
              Interior OS
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
            <Link
              href="/register?role=customer"
              className={`rounded-full px-3 py-2 ${isCustomer ? "bg-amber-100 text-amber-700" : "hover:bg-white"}`}
            >
              Customer Sign Up
            </Link>
            <Link
              href="/register?role=firm"
              className={`rounded-full px-3 py-2 ${isFirm ? "bg-amber-100 text-amber-700" : "hover:bg-white"}`}
            >
              Firm Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="page">
        <div className="page-inner grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="card card-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
              <UserPlus className="h-4 w-4 text-amber-600" />
              {isFirm ? "Firm onboarding" : "Customer onboarding"}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
              {isFirm ? "Apply as a verified firm" : "Create your customer account"}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {isFirm
                ? "Submit firm details and get verified for customer discovery."
                : "Track your milestones, approvals, and documents in one place."}
            </p>
            <div className="mt-6 grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-4 py-3">
                {isFirm ? (
                  <Building2 className="h-4 w-4 text-amber-600" />
                ) : (
                  <User className="h-4 w-4 text-amber-600" />
                )}
                {isFirm ? "Firm verification flow" : "Customer dashboard access"}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-4 py-3">
                <UserPlus className="h-4 w-4 text-amber-600" />
                Quick setup in minutes
              </div>
            </div>
          </section>

          <section className="card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
              {isFirm ? <Building2 className="h-4 w-4 text-amber-600" /> : <User className="h-4 w-4 text-amber-600" />}
              {roleParam === "ADMIN" ? "Admin access" : isFirm ? "Firm sign up" : "Customer sign up"}
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-neutral-900">Create your account</h2>
            <p className="text-sm text-neutral-500">
              {roleParam === "ADMIN"
                ? "Admins are invite-only. Please sign in."
                : "Provide a few details to get started."}
            </p>
            <div className="mt-6">
              {roleParam === "ADMIN" ? (
                <Link href="/login?role=admin" className="text-sm text-neutral-900 underline">
                  Go to admin sign in
                </Link>
              ) : (
                <AuthRegisterForm fixedRole={roleParam} />
              )}
            </div>
            <p className="mt-4 text-sm text-neutral-500">
              Already have an account?{" "}
              <Link href={`/login?role=${roleParam.toLowerCase()}`} className="text-neutral-900 underline">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
