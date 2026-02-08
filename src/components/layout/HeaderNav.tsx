"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";
import { Menu, X, LogIn, LogOut, Loader2, Users, BadgeCheck, MapPin, Settings, IndianRupee, LayoutDashboard, CreditCard, Layers, FolderKanban, User, MessageSquare, Building2, HelpCircle } from "lucide-react";

type SessionUser = {
  id: string;
  email: string;
  role: string;
  name: string | null;
};

type HeaderNavProps = {
  user: SessionUser | null;
  dashboardHref: string | null;
  logoutAction: () => Promise<void>;
};

/** Public nav — when not logged in: only sign-in CTAs (no links in navbar per requirements) */
const navItems: { href: string; label: string; icon: typeof User }[] = [];

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/designers", label: "Designer Approvals", icon: BadgeCheck },
  { href: "/admin/firms-pending-payment", label: "Designers Pending Payment", icon: IndianRupee },
  { href: "/admin/pricing", label: "AI Estimator Pricing", icon: MapPin },
  { href: "/admin/trusted-studios", label: "Trusted Studios", icon: Building2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

/** Customer portal nav — only customer-persona features (/customer/*) */
const customerNavItems = [
  { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/digital-twin", label: "Digital Twin", icon: Layers },
  { href: "/customer/payments", label: "Payment Ledger", icon: CreditCard },
] as const;

/** Designer portal nav — designer = firm in backend */
const designerNavItems = [
  { href: "/firm/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/firm/leads", label: "Leads", icon: FolderKanban },
  { href: "/firm/profile", label: "Profile", icon: User },
  { href: "/firm/payments", label: "Payment Ledger", icon: CreditCard },
] as const;

function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-white hover:bg-[var(--surface-subtle)] transition-colors disabled:opacity-70 disabled:cursor-wait"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        <LogOut className="h-4 w-4 shrink-0" />
      )}
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

function SignOutButtonMobile() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-[var(--foreground)] border-2 border-[var(--border-strong)] hover:bg-[var(--surface-subtle)] transition-colors disabled:opacity-70 disabled:cursor-wait"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)]">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </span>
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export default function HeaderNav({ user, dashboardHref, logoutAction }: HeaderNavProps) {
  const pathname = usePathname();
  const isAppRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/customer") ||
    pathname?.startsWith("/firm");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const isAdmin = user?.role === "ADMIN";
  const isCustomer = user?.role === "CUSTOMER";
  const isFirm = user?.role === "FIRM";

  const desktopLinks = isAdmin
    ? adminNavItems
    : isCustomer
      ? customerNavItems
      : isFirm
        ? designerNavItems
        : navItems;

  return (
    <>
      {/* Desktop: nav links (hidden on app routes; sidebar shows there) + Help + Sign out / CTAs */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3">
        {!isAppRoute &&
          desktopLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        {user ? (
          <>
            <Link
              href="/#contact"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-subtle)] transition-colors"
              title="Help & contact"
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Help</span>
            </Link>
            <span className="h-6 w-px bg-[var(--border)] hidden sm:block" aria-hidden />
            <form action={logoutAction} className="inline-block">
              <SignOutButton />
            </form>
          </>
        ) : (
          <>
            <Link href="/login?role=customer" className="btn btn-secondary text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--surface-subtle)] transition-colors">
              Customer Sign In
            </Link>
            <Link href="/login?role=designer" className="btn btn-primary text-sm font-medium px-4 py-2 rounded-lg">
              Designer Sign In
            </Link>
          </>
        )}
      </div>

      {/* Mobile: menu button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer — portaled to body so it's not clipped by header overflow */}
      {mounted &&
        createPortal(
          <div
            className="md:hidden fixed inset-0 z-[9999]"
            style={{
              visibility: open ? "visible" : "hidden",
              pointerEvents: open ? "auto" : "none",
            }}
            aria-hidden={!open}
          >
            <div
              className="absolute inset-0 bg-[var(--foreground)]/40"
              onClick={close}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="absolute top-0 right-0 bottom-0 w-full max-w-[min(320px,85vw)] bg-white border-l border-[var(--border)] shadow-2xl flex flex-col min-h-0"
              style={{ transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s ease-out" }}
            >
              <div className="flex shrink-0 items-center justify-between p-4 border-b border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--foreground)]">Menu</span>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-2">
                {desktopLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)] hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--brand)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{label}</span>
                  </Link>
                ))}
                <div className="my-2 h-px shrink-0 bg-[var(--border)]" />
                {user ? (
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href="/#contact"
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[var(--foreground)] hover:bg-[var(--surface-subtle)] transition-colors"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--brand)]">
                        <HelpCircle className="h-4 w-4" />
                      </span>
                      <span className="font-medium">Help & contact</span>
                    </Link>
                    <form action={logoutAction} className="block">
                      <SignOutButtonMobile />
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href="/login?role=customer"
                      onClick={close}
                      className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 border border-[var(--border-strong)] text-[var(--foreground)] font-medium hover:bg-[var(--surface-subtle)] transition-colors"
                    >
                      <LogIn className="h-4 w-4 shrink-0" />
                      Customer Sign In
                    </Link>
                    <Link
                      href="/login?role=designer"
                      onClick={close}
                      className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-[var(--brand)] text-white font-semibold hover:opacity-95 transition-opacity"
                    >
                      <LogIn className="h-4 w-4 shrink-0" />
                      Designer Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
