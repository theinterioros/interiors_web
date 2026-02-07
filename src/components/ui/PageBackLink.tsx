import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type PageBackLinkProps = {
  href: string;
  label: string;
};

/**
 * SaaS-style back/secondary nav: first element at top of content.
 * Use for subpages (e.g. Cost estimator → Dashboard).
 */
export default function PageBackLink({ href, label }: PageBackLinkProps) {
  return (
    <div className="mb-4 -mt-1">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
        <span>{label}</span>
      </Link>
    </div>
  );
}
