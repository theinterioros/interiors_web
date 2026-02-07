"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  FolderKanban,
  CreditCard,
  Settings,
  MapPin,
  Building2,
  MessageSquare,
  Calculator,
  Layers,
  User,
  Palette,
} from "lucide-react";

type Role = "admin" | "customer" | "designer";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/designers", label: "Designer approvals", icon: BadgeCheck },
  { href: "/admin/margin-requests", label: "Margin requests", icon: BadgeCheck },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/pricing", label: "AI Estimator pricing", icon: MapPin },
  { href: "/admin/trusted-studios", label: "Trusted studios", icon: Building2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const CUSTOMER_NAV: NavItem[] = [
  { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/designers", label: "Browse designers", icon: Palette },
  { href: "/customer/estimator", label: "Cost estimator", icon: Calculator },
  { href: "/customer/payments", label: "Payment history", icon: CreditCard },
  { href: "/customer/digital-twin", label: "Digital Twin", icon: Layers },
];

const DESIGNER_NAV: NavItem[] = [
  { href: "/firm/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/firm/leads", label: "Leads", icon: MessageSquare },
  { href: "/firm/projects", label: "Projects", icon: FolderKanban },
  { href: "/firm/payments", label: "Payment ledger", icon: CreditCard },
  { href: "/firm/profile", label: "Profile", icon: User },
];

const NAV: Record<Role, NavItem[]> = {
  admin: ADMIN_NAV,
  customer: CUSTOMER_NAV,
  designer: DESIGNER_NAV,
};

function NavList({
  items,
  pathname,
  onLinkClick,
}: {
  items: NavItem[];
  pathname: string;
  onLinkClick?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (pathname.startsWith(href + "/") && href !== pathname);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--surface-subtle)] text-[var(--foreground)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV[role];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[var(--border)] shadow-lg text-[var(--foreground)] hover:bg-[var(--surface-subtle)]"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar — fixed so it doesn't scroll with page */}
      <aside
        className="hidden md:block fixed left-0 top-[var(--header-height)] bottom-0 w-[260px] z-40 border-r border-[var(--border)] bg-white overflow-y-auto"
        style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}
        aria-label="App navigation"
      >
        <nav className="px-3">
          <NavList items={items} pathname={pathname} />
        </nav>
      </aside>

      {/* Mobile drawer */}
      {mounted &&
        createPortal(
          <div
            className="md:hidden fixed inset-0 z-[100]"
            style={{ visibility: mobileOpen ? "visible" : "hidden", pointerEvents: mobileOpen ? "auto" : "none" }}
            aria-hidden={!mobileOpen}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="absolute top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-white border-r border-[var(--border)] shadow-xl flex flex-col"
              style={{
                transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.2s ease-out",
              }}
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <span className="font-semibold text-[var(--foreground)]">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-5 px-3">
                <NavList items={items} pathname={pathname} onLinkClick={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
