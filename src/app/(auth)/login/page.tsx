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
              href="/login?role=customer"
              className={`rounded-full px-3 py-2 ${isCustomer ? "bg-amber-100 text-amber-700" : "hover:bg-white"}`}
            >
              Customer Sign In
            </Link>
            <Link
              href="/login?role=firm"
              className={`rounded-full px-3 py-2 ${isFirm ? "bg-amber-100 text-amber-700" : "hover:bg-white"}`}
            >
              Firm Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="page">
        <div className="page-inner grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="card card-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
              <LogIn className="h-4 w-4 text-amber-600" />
              {isFirm ? "Firm access" : "Customer access"}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
              {isFirm ? "Sign in to manage projects" : "Sign in to track your home"}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {isFirm
                ? "Handle leads, milestones, and approvals with clarity."
                : "Approve milestones, view updates, and access your digital twin."}
            </p>
            <div className="mt-6 grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-4 py-3">
                {isFirm ? (
                  <Building2 className="h-4 w-4 text-amber-600" />
                ) : (
                  <User className="h-4 w-4 text-amber-600" />
                )}
                {isFirm ? "Firm dashboard access" : "Customer dashboard access"}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                Secure sign-in with OTP option
              </div>
            </div>
          </section>

          <section className="card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
              {isFirm ? <Building2 className="h-4 w-4 text-amber-600" /> : <User className="h-4 w-4 text-amber-600" />}
              {isFirm ? "Firm sign in" : "Customer sign in"}
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-neutral-900">Welcome back</h2>
            <p className="text-sm text-neutral-500">Use your email or mobile to continue.</p>
            <div className="mt-6">
              <AuthLoginForm otpEnabled={settings.otpEnabled} />
            </div>
            <p className="mt-4 text-sm text-neutral-500">
              New here?{" "}
              <Link href={`/register?role=${role}`} className="text-neutral-900 underline">
                Create an account
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
