"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { APP_NAV, type AppRole, type NavItem } from "@/lib/appNav";

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
      {items.filter((item) => !item.isMore).map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (pathname.startsWith(href + "/") && href !== pathname);
        const isVisualization = href === "/customer/visualization";
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? isVisualization
                    ? "bg-[var(--brand-light)] text-[var(--brand)] ring-1 ring-[var(--brand)]/40"
                    : "bg-[var(--surface-subtle)] text-[var(--foreground)]"
                  : isVisualization
                    ? "text-[var(--brand)] bg-[var(--brand-light)]/60 hover:bg-[var(--brand-light)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              <span className="truncate">{label}</span>
              {isVisualization ? (
                <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand)]">
                  AI
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function AppSidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = APP_NAV[role];
  const [mobileOpen, setMobileOpen] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <MobileBottomNav
        role={role}
        onOpenMenu={role === "admin" ? () => setMobileOpen(true) : undefined}
      />

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
      {isClient &&
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
