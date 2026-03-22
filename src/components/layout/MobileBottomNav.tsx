"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV_MOBILE, type AppRole } from "@/lib/appNav";

export default function MobileBottomNav({
  role,
  onOpenMenu,
}: {
  role: AppRole;
  onOpenMenu?: () => void;
}) {
  const pathname = usePathname();
  const items = APP_NAV_MOBILE[role];

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
          const isVisualization = item.href === "/customer/visualization";
          const Icon = item.icon;
          const label = item.shortLabel ?? item.label;

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
                <span className="text-[10px] font-medium truncate w-full text-center">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 px-1 touch-manipulation ${
                active
                  ? "text-[var(--brand)]"
                  : isVisualization
                    ? "text-[var(--brand)]"
                    : "text-[var(--text-muted)]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] font-medium truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
