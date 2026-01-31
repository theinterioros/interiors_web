"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, LayoutGrid, Building2, Calculator, Box, LogIn, LogOut, Users, BadgeCheck, MapPin, Settings, IndianRupee, LayoutDashboard, CreditCard, Layers, FolderKanban, User, MessageSquare } from "lucide-react";

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

/** Public nav — when not logged in */
const navItems = [
  { href: "/#how-it-works", label: "How it works", icon: LayoutGrid },
  { href: "/designers", label: "Firms", icon: Building2 },
  { href: "/estimator", label: "AI Cost Estimator", icon: Calculator },
  { href: "/digital-twin", label: "Digital Twin", icon: Box },
] as const;

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Contact Leads", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/designers", label: "Firm Approvals", icon: BadgeCheck },
  { href: "/admin/firms-pending-payment", label: "Firms Pending Payment", icon: IndianRupee },
  { href: "/admin/pricing", label: "AI Estimator Pricing", icon: MapPin },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

/** Customer portal nav — only customer-persona features (/customer/*) */
const customerNavItems = [
  { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/digital-twin", label: "Digital Twin", icon: Layers },
  { href: "/customer/payments", label: "Payments", icon: CreditCard },
] as const;

/** Firm portal nav — only firm-persona features (/firm/*) */
const firmNavItems = [
  { href: "/firm/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/firm/leads", label: "Leads", icon: FolderKanban },
  { href: "/firm/profile", label: "Profile", icon: User },
] as const;

export default function HeaderNav({ user, dashboardHref, logoutAction }: HeaderNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        ? firmNavItems
        : navItems;

  return (
    <>
      {/* Desktop nav — hidden on mobile */}
      <nav className="hidden md:flex items-center gap-3 lg:gap-4">
        {desktopLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap"
          >
            {label}
          </Link>
        ))}
        {user ? (
          <form action={logoutAction} className="inline-block">
            <button type="submit" className="btn btn-ghost text-sm">
              Sign out
            </button>
          </form>
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

      {/* Mobile: menu button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer — portal so it's above everything; only after mount to avoid hydration issues */}
      {mounted &&
        createPortal(
          <div
            className="md:hidden fixed inset-0"
            style={{ zIndex: 9999, pointerEvents: open ? "auto" : "none" }}
            aria-hidden={!open}
          >
            <div
              className="absolute inset-0 bg-[var(--foreground)]/25 backdrop-blur-sm transition-opacity duration-200"
              style={{ opacity: open ? 1 : 0 }}
              onClick={close}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="absolute top-0 right-0 bottom-0 w-full max-w-[min(320px,85vw)] bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col transition-transform duration-300 ease-out"
              style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
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
              <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 min-h-0">
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
                <div className="my-4 h-px bg-[var(--border)]" />
                {user ? (
                  <form action={logoutAction} className="block">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] transition-colors"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                          <LogOut className="h-4 w-4" />
                        </span>
                        <span className="font-medium">Sign out</span>
                      </button>
                    </form>
                ) : (
                  <>
                    <Link
                      href="/login?role=customer"
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)] hover:bg-[var(--surface-subtle)] transition-colors"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--brand)]">
                        <LogIn className="h-4 w-4" />
                      </span>
                      <span className="font-medium">Customer Sign In</span>
                    </Link>
                    <Link
                      href="/login?role=firm"
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 bg-[var(--brand)] text-white hover:opacity-95 transition-opacity"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
                        <LogIn className="h-4 w-4" />
                      </span>
                      <span className="font-semibold">Firm Sign In</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
