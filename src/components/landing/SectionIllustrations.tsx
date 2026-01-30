"use client";

/**
 * Section illustrations: full-width strips and subtle background graphics
 * to counter whitespace and integrate with the layout (no small floating boxes).
 */

/** How it works — full-width journey strip under the heading */
export function HowItWorksIllo() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4" aria-hidden>
      <div className="relative h-1 rounded-full bg-gradient-to-r from-transparent via-[var(--brand)]/20 to-transparent" />
      <div className="flex justify-between mt-2 -mx-1">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="h-2 w-2 rounded-full bg-[var(--brand)]/50 shrink-0"
            style={{ opacity: 0.4 + (n / 6) * 0.5 }}
          />
        ))}
      </div>
    </div>
  );
}

/** AI Cost Estimator — large subtle background (house + numbers) */
export function BudgetIllo() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]"
      aria-hidden
    >
      <svg
        viewBox="0 0 400 280"
        className="absolute -right-20 -bottom-10 w-[320px] h-[220px] md:w-[420px] md:h-[280px] text-[var(--brand)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <path d="M200 60 L80 140 L80 240 L320 240 L320 140 Z" />
        <path d="M200 60 L200 140 M120 140 L280 140" strokeWidth="1" opacity="0.7" />
        <rect x="160" y="160" width="80" height="36" rx="4" fill="currentColor" fillOpacity="0.15" />
        <path d="M175 178 h50 M175 188 h35" strokeWidth="1.5" opacity="0.8" />
      </svg>
    </div>
  );
}

/** Verified Firms — large subtle background (building silhouette) */
export function VerifiedFirmsIllo() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]"
      aria-hidden
    >
      <svg
        viewBox="0 0 320 200"
        className="absolute -left-10 top-1/2 -translate-y-1/2 w-[280px] h-[180px] md:w-[360px] md:h-[220px] text-[var(--brand)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <rect x="80" y="60" width="160" height="130" rx="4" />
        <path d="M120 60 L120 30 L200 30 L200 60" />
        <line x1="100" y1="90" x2="220" y2="90" strokeWidth="1" opacity="0.6" />
        <line x1="100" y1="115" x2="180" y2="115" strokeWidth="1" opacity="0.6" />
        <circle cx="250" cy="85" r="18" fill="currentColor" fillOpacity="0.12" />
        <path d="M238 85 l6 6 12 -12" strokeWidth="2" />
      </svg>
    </div>
  );
}

/** Project tracking — large subtle background (checklist) */
export function ProjectTrackingIllo() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]"
      aria-hidden
    >
      <svg
        viewBox="0 0 280 200"
        className="absolute -right-16 top-1/2 -translate-y-1/2 w-[260px] h-[180px] md:w-[320px] md:h-[220px] text-[var(--brand)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="40" y="20" width="160" height="160" rx="8" />
        <path d="M62 52 L72 62 L98 36" strokeWidth="2.5" />
        <path d="M62 92 L72 102 L98 76" strokeWidth="2.5" opacity="0.8" />
        <path d="M62 132 L72 142 L88 126" strokeWidth="2.5" opacity="0.6" />
      </svg>
    </div>
  );
}

/** Digital twin — large subtle background (folder) */
export function DigitalTwinIllo() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]"
      aria-hidden
    >
      <svg
        viewBox="0 0 320 220"
        className="absolute -left-10 top-1/2 -translate-y-1/2 w-[280px] h-[200px] md:w-[340px] md:h-[240px] text-[var(--brand)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <path d="M60 50 L160 20 L260 50 L260 190 L60 190 Z" />
        <circle cx="160" cy="50" r="12" fill="currentColor" fillOpacity="0.2" />
        <line x1="80" y1="90" x2="240" y2="90" strokeWidth="1" opacity="0.7" />
        <line x1="80" y1="120" x2="220" y2="120" strokeWidth="1" opacity="0.7" />
        <line x1="80" y1="150" x2="200" y2="150" strokeWidth="1" opacity="0.7" />
      </svg>
    </div>
  );
}

/** Who it's for — centered divider with two soft shapes */
export function WhoItsForIllo() {
  return (
    <div className="w-full max-w-xl mx-auto mb-8 flex items-center justify-center gap-8" aria-hidden>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--border)]" />
      <div className="flex items-center gap-6">
        <div className="h-12 w-12 rounded-2xl bg-[var(--brand)]/10 flex items-center justify-center">
          <div className="h-5 w-5 rounded-md border-2 border-[var(--brand)]/40" />
        </div>
        <div className="h-8 w-px bg-[var(--border)]" />
        <div className="h-12 w-12 rounded-2xl bg-[var(--foreground)]/5 flex items-center justify-center">
          <div className="h-6 w-5 rounded border border-[var(--foreground)]/20" />
        </div>
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--border)]" />
    </div>
  );
}

/** Trust built in — large soft shield behind heading (no box) */
export function TrustIllo() {
  return (
    <div
      className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 md:w-28 md:h-28 opacity-20"
      aria-hidden
    >
      <svg
        viewBox="0 0 60 70"
        className="w-full h-full text-[var(--brand-light)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M30 8 L8 18 L8 35 Q8 52 30 62 Q52 52 52 35 L52 18 Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M30 8 L8 18 L8 35 Q8 52 30 62 Q52 52 52 35 L52 18 Z" />
        <path d="M24 35 L28 39 L38 28" strokeWidth="2" />
      </svg>
    </div>
  );
}

/** Start with clarity — three steps, single brand accent (restrained colors) */
export function StartWithClarityIllo() {
  const steps = [
    { label: "Estimate", icon: "calc" },
    { label: "Choose firm", icon: "building" },
    { label: "Track", icon: "check" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8" aria-hidden>
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--brand)]">
            {step.icon === "calc" && (
              <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M8 6 h8 M8 10 h8 M8 14 h4 M14 14 h2" />
              </svg>
            )}
            {step.icon === "building" && (
              <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21 h18 M5 21 V7 l7-4 7 4 v14 M9 21 v-6 h6 v6" />
              </svg>
            )}
            {step.icon === "check" && (
              <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 L9 17 l-5-5" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium text-[var(--text-muted)]">{step.label}</span>
          {i < steps.length - 1 && (
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-[var(--border)] hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18 l6-6 -6-6" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
