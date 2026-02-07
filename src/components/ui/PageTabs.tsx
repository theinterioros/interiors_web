import Link from "next/link";

export type TabItem = {
  label: string;
  href: string;
  active: boolean;
  count?: number;
};

export default function PageTabs({ tabs, className = "" }: { tabs: TabItem[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-1 border-b border-[var(--border)] mb-6 ${className}`.trim()}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab.active
              ? "border-[var(--brand)] text-[var(--brand)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={
                tab.active
                  ? "rounded-full bg-[var(--brand)]/15 text-[var(--brand)] px-2 py-0.5 text-xs font-medium"
                  : "rounded-full bg-[var(--surface-subtle)] text-[var(--text-muted)] px-2 py-0.5 text-xs"
              }
            >
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
