import Link from "next/link";
import { Shield, User, Palette } from "lucide-react";
import AuthLoginForm from "@/components/forms/AuthLoginForm";
import { getAdminSettings } from "@/lib/settings";
import LoginRoleSelector from "./LoginRoleSelector";

export const metadata = {
  title: "Sign in",
  description: "Sign in to Interior OS as a customer, designer, or admin.",
};

const PERSONAS = [
  {
    role: "customer" as const,
    label: "Customer",
    description: "Estimate costs, find designers, manage projects",
    icon: User,
    href: "/login?role=customer",
  },
  {
    role: "firm" as const,
    label: "Designer",
    description: "Manage profile, leads, milestones & payments",
    icon: Palette,
    href: "/login?role=designer",
  },
  {
    role: "admin" as const,
    label: "Admin",
    description: "Platform control, approvals & payment release",
    icon: Shield,
    href: "/login?role=admin",
  },
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string; reset?: string; redirect?: string }>;
}) {
  const settings = await getAdminSettings();
  const resolvedParams = await searchParams;
  const resetSuccess = resolvedParams?.reset === "1";
  const redirectTo = typeof resolvedParams?.redirect === "string" && resolvedParams.redirect.startsWith("/") && !resolvedParams.redirect.startsWith("//")
    ? resolvedParams.redirect
    : undefined;
  const role =
    resolvedParams?.role === "firm" || resolvedParams?.role === "designer"
      ? "firm"
      : resolvedParams?.role === "admin"
        ? "admin"
        : "customer";

  const current = PERSONAS.find((p) => p.role === role) ?? PERSONAS[0];
  const Icon = current.icon;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left: Brand + account type — fixed on desktop */}
        <aside
          className="relative w-full lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:z-10 lg:w-[420px] lg:h-screen flex-shrink-0 overflow-hidden"
          aria-label="Account type"
        >
          {/* Subtle gradient + grid pattern for depth */}
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

          <div className="relative flex flex-col h-full min-h-[280px] lg:h-full lg:min-h-0 p-8 lg:p-10 lg:pt-14">
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
                Sign in to your account
              </h2>
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed max-w-[320px]">
                Sign in with your customer, designer, or admin account.
              </p>
            </div>

            <p className="hidden lg:block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-subtle)] mb-4">
              Account type
            </p>
            <nav className="hidden lg:block space-y-3">
              {PERSONAS.map((p) => {
                const isActive = p.role === role;
                const PIcon = p.icon;
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
                      <PIcon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <span className={`block font-semibold text-[15px] ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]"}`}>
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
              Secure sign-in. Your data is protected.
            </p>
          </div>
        </aside>

        {/* Right: Sign-in form */}
        <div className="flex-1 flex flex-col justify-center min-w-0 max-w-full overflow-hidden lg:ml-[420px] px-4 py-8 sm:px-6 lg:px-14 xl:px-20 bg-white lg:bg-transparent">
          <div className="mx-auto w-full max-w-[400px]">
            {/* Mobile role switcher */}
            <div className="lg:hidden mb-6">
              <LoginRoleSelector
                currentRole={role}
                personas={PERSONAS.map(({ icon: _, ...p }) => ({ ...p, accent: "bg-[var(--surface-subtle)] border-[var(--brand)]", iconBg: "" }))}
              />
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--brand)]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h1 className="text-lg font-semibold text-[var(--foreground)]">
                    Sign in as {current.label}
                  </h1>
                  <p className="text-sm text-[var(--text-muted)]">{current.description}</p>
                </div>
              </div>

              {resetSuccess && (
                <p className="text-sm text-green-800 mb-4 rounded-lg bg-green-50 px-3 py-2 border border-green-100">
                  Password reset successfully. Sign in with your new password.
                </p>
              )}

              <AuthLoginForm
                key={role}
                role={role}
                otpEnabled={settings.otpEnabled}
                isDesigner={role === "firm"}
                redirectTo={redirectTo}
              />

              <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-2">
                <p className="text-sm">
                  <Link
                    href={role ? `/forgot-password?role=${role}` : "/forgot-password"}
                    className="text-[var(--brand)] font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  New here?{" "}
                  <Link href={role === "admin" ? "/register?role=customer" : `/register?role=${role}`} className="text-[var(--brand)] font-medium hover:underline">
                    {role === "firm" ? "Apply as a designer" : role === "admin" ? "Customers: create account" : "Create an account"}
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-[var(--text-subtle)]">
              By signing in, you agree to our terms of service.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}