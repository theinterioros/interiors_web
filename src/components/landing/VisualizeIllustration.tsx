"use client";

/**
 * Illustration flow for "Visualize your space before it's built":
 * Floor plan → AI styles → Styled room
 */
export default function VisualizeIllustration() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 mb-8">
        {/* 1. Floor plan */}
        <div className="flex flex-col items-center text-center">
          <div
            className="relative rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-subtle)] p-6 w-[140px] h-[100px] sm:w-[160px] sm:h-[110px] flex items-center justify-center shadow-sm"
            aria-hidden
          >
            <svg
              viewBox="0 0 120 80"
              className="w-full h-full text-[var(--foreground)]/70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              {/* Room outlines - simple floor plan */}
              <rect x="8" y="8" width="45" height="35" rx="2" />
              <rect x="58" y="8" width="54" height="35" rx="2" />
              <rect x="8" y="48" width="50" height="24" rx="2" />
              <rect x="63" y="48" width="49" height="24" rx="2" />
              <path d="M53 8v35M8 43h45M58 43h54M8 48h50M63 48h49" strokeWidth="1.2" opacity="0.6" />
            </svg>
          </div>
          <p className="mt-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Your floor plan
          </p>
        </div>

        {/* Arrow + sparkles (AI step) */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div
            className="rounded-full bg-[var(--brand-light)] border-2 border-[var(--brand)]/30 p-4 text-[var(--brand)]"
            aria-hidden
          >
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 0-1.275 0L7.373 3" />
              <path d="m12 21 1.912-5.813a2 2 0 0 1 1.275 0L16.627 21" />
              <path d="m3 12 5.813-1.912a2 2 0 0 1 0-1.275L3 7.373" />
              <path d="m21 12-5.813 1.912a2 2 0 0 1 0 1.275L21 16.627" />
            </svg>
          </div>
          <p className="mt-3 text-xs font-semibold text-[var(--brand)] uppercase tracking-wider">
            AI styles
          </p>
        </div>

        {/* 2. Styled room */}
        <div className="flex flex-col items-center text-center">
          <div
            className="relative rounded-2xl border-2 border-[var(--brand)]/30 bg-gradient-to-br from-[var(--brand-light)]/40 to-white p-6 w-[140px] h-[100px] sm:w-[160px] sm:h-[110px] flex items-center justify-center shadow-md"
            aria-hidden
          >
            <svg
              viewBox="0 0 120 80"
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Window */}
              <rect
                x="40"
                y="6"
                width="40"
                height="22"
                rx="2"
                className="text-[var(--brand)]/50"
                fill="rgba(0, 82, 204, 0.08)"
              />
              <line x1="60" y1="6" x2="60" y2="28" className="text-[var(--brand)]/30" />
              <line x1="40" y1="17" x2="80" y2="17" className="text-[var(--brand)]/30" />
              {/* Sofa */}
              <path
                d="M12 52 L12 68 L68 68 L68 52 Q68 48 64 48 L16 48 Q12 48 12 52Z"
                className="text-[var(--foreground)]/60"
                fill="rgba(10, 37, 64, 0.06)"
              />
              <path d="M16 52 L16 64 L64 64 L64 52" strokeWidth="1.2" className="text-[var(--foreground)]/50" />
              {/* Side table + plant */}
              <rect x="74" y="58" width="14" height="14" rx="2" className="text-[var(--foreground)]/40" fill="rgba(10, 37, 64, 0.05)" />
              <circle cx="81" cy="64" r="3" className="text-[var(--brand)]" fill="currentColor" fillOpacity="0.4" />
              <path d="M81 58 L81 52 Q81 48 85 46" strokeWidth="1" className="text-[var(--brand)]" />
              <ellipse cx="85" cy="44" rx="4" ry="3" className="text-[var(--brand)]" fill="currentColor" fillOpacity="0.25" />
            </svg>
          </div>
          <p className="mt-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            See your space
          </p>
        </div>
      </div>
    </div>
  );
}
