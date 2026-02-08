"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  Calculator,
  Layers,
  User,
  Palette,
  MessageSquare,
  Menu,
} from "lucide-react";

type Role = "admin" | "customer" | "designer";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const ADMIN_BOTTOM: (NavItem & { isMore?: boolean })[] = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "#", label: "More", icon: Menu, isMore: true },
];

const CUSTOMER_BOTTOM: NavItem[] = [
  { href: "/customer/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/designers", label: "Designers", icon: Palette },
  { href: "/customer/estimator", label: "Estimate", icon: Calculator },
  { href: "/customer/payments", label: "Payments", icon: CreditCard },
  { href: "/customer/digital-twin", label: "Twin", icon: Layers },
];

const DESIGNER_BOTTOM: NavItem[] = [
  { href: "/firm/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/firm/leads", label: "Leads", icon: MessageSquare },
  { href: "/firm/projects", label: "Projects", icon: FolderKanban },
  { href: "/firm/payments", label: "Payments", icon: CreditCard },
  { href: "/firm/profile", label: "Profile", icon: User },
];

const BOTTOM_NAV: Record<Role, (NavItem & { isMore?: boolean })[]> = {
  admin: ADMIN_BOTTOM,
  customer: CUSTOMER_BOTTOM,
  designer: DESIGNER_BOTTOM,
};

export default function MobileBottomNav({
  role,
  onOpenMenu,
}: {
  role: Role;
  onOpenMenu?: () => void;
}) {
  const pathname = usePathname();
  const items = BOTTOM_NAV[role];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--border)] safe-area-bottom"
      aria-label="App navigation"
    >
      <div className="flex items-center justify-around h-16 min-h-[4rem]">
        {items.map((item) => {
          const active =
            !item.isMore &&
            (pathname === item.href || pathname.startsWith(item.href + "/"));
          const Icon = item.icon;

          if (item.isMore && onOpenMenu) {
            return (
              <button
                key="more"
                type="button"
                onClick={onOpenMenu}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 px-1 text-[var(--text-muted)] active:bg-[var(--surface-subtle)] touch-manipulation"
                aria-label="Open menu"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] font-medium truncate w-full text-center">More</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 px-1 touch-manipulation ${
                active ? "text-[var(--brand)]" : "text-[var(--text-muted)]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
