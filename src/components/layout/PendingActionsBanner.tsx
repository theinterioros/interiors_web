import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import type { PendingAction } from "@/lib/pendingActions";

type Props = { items: PendingAction[] };

export default function PendingActionsBanner({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div
      className="border-b border-[var(--accent-amber)]/40 bg-[var(--accent-amber)]/10 px-4 py-2.5 sm:px-6"
      role="region"
      aria-label="Pending actions"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
          <Bell className="h-4 w-4 text-[var(--accent-amber)] shrink-0" aria-hidden />
          Action required
        </span>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex items-center gap-1 text-sm text-[var(--foreground)] hover:text-[var(--brand)] hover:underline font-medium"
              >
                {item.label}
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
