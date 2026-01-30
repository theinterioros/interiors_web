import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Role } from "@/lib/types";

type SessionUser = {
  id: string;
  email: string;
  role: Role;
  name: string | null;
};

export default function SiteHeader({ user }: { user: SessionUser | null }) {
  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "FIRM"
        ? "/firm/dashboard"
        : user?.role === "CUSTOMER"
          ? "/customer/dashboard"
          : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
      <div className="page-inner">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--foreground)] text-sm font-semibold text-white">
              IO
            </div>
            <span className="text-sm font-semibold text-[var(--foreground)]">Interior OS</span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-6">
            <Link
              href="/#how-it-works"
              className="hidden text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] md:inline-block"
            >
              How it works
            </Link>
            <Link
              href="/designers"
              className="hidden text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] md:inline-block"
            >
              Firms
            </Link>
            <Link
              href="/estimator"
              className="hidden text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] md:inline-block"
            >
              Estimator
            </Link>
            <Link
              href="/digital-twin"
              className="hidden text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] md:inline-block"
            >
              Digital Twin
            </Link>
            {user ? (
              <>
                {dashboardHref && (
                  <Link href={dashboardHref} className="btn btn-secondary text-sm">
                    Dashboard
                  </Link>
                )}
                <form action={logoutAction} className="inline-block">
                  <button type="submit" className="btn btn-ghost text-sm">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login?role=customer" className="btn btn-secondary text-sm">
                  Customer Sign In
                </Link>
                <Link href="/login?role=firm" className="btn btn-primary text-sm">
                  Firm Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
