"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";
import { Menu, X, LogIn, LogOut, Loader2, HelpCircle } from "lucide-react";
import { APP_NAV, type AppRole } from "@/lib/appNav";

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

const roleToAppRole = (role: string): AppRole | null =>
  role === "ADMIN" ? "admin" : role === "CUSTOMER" ? "customer" : role === "FIRM" ? "designer" : null;

function roleToDesignation(role: string): string {
  if (role === "ADMIN") return "Admin";
  if (role === "CUSTOMER") return "Customer";
  if (role === "FIRM") return "Designer";
  return "User";
}

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
  const isAppRoute = pathname
    ? ["/admin", "/customer", "/designer", "/designers"].some(
        (base) => pathname === base || pathname.startsWith(base + "/")
      )
    : false;
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

  const appRole = user ? roleToAppRole(user.role) : null;
  const desktopLinks = appRole ? APP_NAV[appRole].filter((item) => !item.isMore) : [];
  /** In-app (dashboard) routes: sidebar/bottom nav handle navigation; header only shows Help + Sign out */
  const showNavInHeader = !isAppRoute;

  return (
    <>
      {/* Desktop: nav links only when not in app (in app, sidebar is the nav) + Help + Sign out / CTAs */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3">
        {showNavInHeader &&
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
            <span className="hidden sm:inline text-sm text-[var(--text-muted)] truncate max-w-[180px]" title={`${user.name || user.email} · ${roleToDesignation(user.role)}`}>
              {user.name || user.email}
              <span className="text-[var(--foreground)] font-medium ml-1">· {roleToDesignation(user.role)}</span>
            </span>
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
              <div className="flex shrink-0 items-center justify-between gap-2 p-4 border-b border-[var(--border)]">
                <div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">Menu</span>
                  {user && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{user.name || user.email} · {roleToDesignation(user.role)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-2">
                {showNavInHeader &&
                  desktopLinks.map(({ href, label, icon: Icon }) => (
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
                {showNavInHeader && desktopLinks.length > 0 && (
                  <div className="my-2 h-px shrink-0 bg-[var(--border)]" />
                )}
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
