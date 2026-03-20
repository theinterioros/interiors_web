import Link from "next/link";
import { Suspense } from "react";
import { Shield, User, Palette } from "lucide-react";
import AuthRegisterForm from "@/components/forms/AuthRegisterForm";

export const metadata = {
  title: "Create account",
  description: "Register as a customer or apply as an interior designer on Interior OS.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  let resolvedParams: { role?: string } | undefined;
  try {
    resolvedParams = searchParams != null ? await searchParams : undefined;
  } catch {
    resolvedParams = undefined;
  }
  const roleParam =
    resolvedParams?.role === "firm" || resolvedParams?.role === "designer"
      ? "FIRM"
      : resolvedParams?.role === "admin"
        ? "ADMIN"
        : "CUSTOMER";

  const PERSONAS = [
    {
      role: "customer" as const,
      label: "Customer",
      description: "Estimate costs, find designers, manage projects",
      icon: User,
      href: "/register?role=customer",
    },
    {
      role: "firm" as const,
      label: "Designer",
      description: "Apply as a designer, get leads & projects",
      icon: Palette,
      href: "/register?role=designer",
    },
  ];

  const current =
    roleParam === "ADMIN"
      ? null
      : roleParam === "FIRM"
        ? PERSONAS[1]
        : PERSONAS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left: Fixed on desktop */}
        <aside
          className="relative w-full lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:z-10 lg:w-[420px] lg:h-screen flex-shrink-0 overflow-hidden"
          aria-label="Account type"
        >
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `
                linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%),
                linear-gradient(to right, rgba(148,163,184,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148,163,184,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "100% 100%, 24px 24px, 24px 24px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent" />

          <div className="relative flex flex-col h-full min-h-[240px] lg:h-full lg:min-h-0 p-8 lg:p-10 lg:pt-14">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[var(--foreground)] no-underline mb-12 lg:mb-16"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--foreground)] text-white text-sm font-semibold">
                IO
              </span>
              <span className="text-xl font-semibold tracking-tight">Interior OS</span>
            </Link>

            <div className="mb-10 lg:mb-12">
              <h2 className="text-2xl lg:text-[1.75rem] font-semibold text-[var(--foreground)] tracking-tight mb-2">
                Create your account
              </h2>
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed max-w-[320px]">
                Create a customer account or apply as an interior designer.
              </p>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-subtle)] mb-4">
              Account type
            </p>
            <nav className="space-y-3">
              {PERSONAS.map((p) => {
                const isActive =
                  (p.role === "customer" && roleParam === "CUSTOMER") ||
                  (p.role === "firm" && roleParam === "FIRM");
                const Icon = p.icon;
                return (
                  <Link
                    key={p.role}
                    href={p.href}
                    scroll={false}
                    className={`group flex items-start gap-4 rounded-2xl p-4 transition-all duration-200 ${
                      isActive
                        ? "bg-white shadow-sm ring-1 ring-[var(--brand)]/20 ring-inset border border-[var(--brand)]/30"
                        : "bg-white/70 border border-[var(--border)] hover:bg-white hover:border-[var(--border-strong)] hover:shadow-sm"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isActive ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-subtle)] text-[var(--text-muted)] group-hover:bg-[var(--border)] group-hover:text-[var(--foreground)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <span className="block font-semibold text-[15px] text-[var(--foreground)]">
                        {p.label}
                      </span>
                      <span className="block text-[13px] text-[var(--text-muted)] mt-0.5 leading-snug">
                        {p.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <p className="mt-auto pt-10 text-[13px] text-[var(--text-subtle)] hidden lg:block">
              Admin accounts are invite-only.{" "}
              <Link href="/login?role=admin" className="text-[var(--brand)] hover:underline">
                Sign in as admin
              </Link>
            </p>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-0 overflow-x-hidden overflow-y-auto min-w-0 max-w-full lg:ml-[420px]">
          <div className="flex flex-col justify-center flex-1 px-4 py-8 sm:px-6 lg:px-12 xl:px-20 bg-white lg:bg-transparent max-w-full">
            <div
              className={`mx-auto w-full ${roleParam === "FIRM" ? "max-w-[440px] sm:max-w-[640px] lg:max-w-[900px] xl:max-w-[960px]" : "max-w-[440px] sm:max-w-[520px]"}`}
            >
              {roleParam === "ADMIN" ? (
                <div className="rounded-2xl border border-[var(--border)] bg-white p-8 lg:p-10 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                      <Shield className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h1 className="text-lg font-semibold text-[var(--foreground)]">Admin</h1>
                      <p className="text-sm text-[var(--text-muted)]">Admin accounts are invite-only.</p>
                    </div>
                  </div>
                  <Link href="/login?role=admin" className="btn btn-primary">
                    Go to sign in
                  </Link>
                </div>
              ) : current ? (
                <div
                  className={`rounded-2xl border border-[var(--border)] bg-white shadow-sm ${
                    roleParam === "FIRM"
                      ? "p-8 sm:p-9 lg:p-10 xl:p-11 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                      : "p-8 lg:p-10"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--brand)] ring-1 ring-[var(--border)]/80">
                      <current.icon className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h1 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">
                        Create {current.label} account
                      </h1>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-snug">{current.description}</p>
                    </div>
                  </div>
                  <Suspense
                    fallback={
                      <div
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90"
                        aria-busy="true"
                      >
                        <div
                          className="h-10 w-10 rounded-full border-2 border-[var(--brand)]/30 border-t-[var(--brand)] animate-spin"
                          aria-hidden
                        />
                        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading form...</p>
                      </div>
                    }
                  >
                    <AuthRegisterForm key={roleParam} fixedRole={roleParam} />
                  </Suspense>
                  <p className="mt-8 pt-6 border-t border-[var(--border)] text-sm text-[var(--text-muted)] leading-relaxed">
                    Already have an account?{" "}
                    <Link
                      href={`/login?role=${roleParam === "FIRM" ? "designer" : "customer"}`}
                      className="text-[var(--brand)] font-medium hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
