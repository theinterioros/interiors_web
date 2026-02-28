"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCallback } from "react";

type Props = {
  /** Current search query (from URL). */
  value?: string;
  /** Query param name for search. Default "q". */
  paramName?: string;
  /** Placeholder for the search input. */
  placeholder?: string;
  /** Optional: preserve these query params when updating search (e.g. status, role). */
  preserveParams?: Record<string, string>;
  /** Additional class for the wrapper. */
  className?: string;
};

export default function TableFilterBar({
  value = "",
  paramName = "q",
  placeholder = "Search…",
  preserveParams = {},
  className = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const buildQueryString = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set(paramName, q.trim());
      Object.entries(preserveParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      const s = params.toString();
      return s ? `?${s}` : "";
    },
    [paramName, preserveParams]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = form.elements.namedItem("q") as HTMLInputElement;
    const q = input?.value?.trim() ?? "";
    router.push(pathname + buildQueryString(q));
  };

  const handleClear = () => {
    router.push(pathname + buildQueryString(""));
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 w-full sm:w-auto sm:min-w-[260px] sm:shrink-0 ${className}`.trim()}>
      <div className="relative flex-1 min-w-[140px] w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="search"
          name="q"
          defaultValue={value}
          key={value}
          placeholder={placeholder}
          className="input w-full min-w-0 pl-9 pr-9 py-2 text-sm"
          aria-label="Search"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-secondary text-sm py-2 shrink-0">
        Search
      </button>
    </form>
  );
}
