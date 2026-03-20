"use client";

import type { EstimatorApiData } from "@/lib/estimator-types";

const ROWS: { key: keyof EstimatorApiData["breakdown"]; label: string }[] = [
  { key: "kitchen", label: "Kitchen" },
  { key: "wardrobes", label: "Wardrobes" },
  { key: "tvUnit", label: "TV unit" },
  { key: "falseCeiling", label: "False ceiling" },
  { key: "lighting", label: "Lighting" },
  { key: "others", label: "Others" },
];

type Props = {
  result: EstimatorApiData;
  /** Show “Formula / AI” badge for debugging */
  showSource?: boolean;
};

export default function EstimatorResultSummary({ result, showSource = false }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-[var(--text-muted)] mb-1">Interior type</p>
        <p className="text-base font-semibold text-[var(--foreground)]">{result.interiorType}</p>
      </div>
      <div>
        <p className="text-sm text-[var(--text-muted)] mb-1">Estimated cost range</p>
        <p className="text-2xl sm:text-3xl font-bold text-[var(--brand)]">
          ₹{result.min.toLocaleString()} – ₹{result.max.toLocaleString()}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">{result.currency}</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/40 overflow-hidden">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] px-4 pt-3 pb-2">
          Cost breakdown (approx.)
        </p>
        <ul className="divide-y divide-[var(--border)]">
          {ROWS.map(({ key, label }) => (
            <li key={key} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="text-[var(--text-muted)]">{label}</span>
              <span className="font-medium text-[var(--foreground)] tabular-nums">
                ₹{result.breakdown[key].toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
        <span>
          Flat size: <strong className="text-[var(--foreground)]">{result.flatSizeSqFt.toLocaleString()} sq ft</strong>
        </span>
        <span aria-hidden className="text-[var(--border)]">
          ·
        </span>
        <span>
          Timeline: <strong className="text-[var(--foreground)]">~{result.timelineWeeks} weeks</strong>
        </span>
        {showSource && (
          <>
            <span aria-hidden className="text-[var(--border)]">
              ·
            </span>
            <span className="text-xs uppercase">Source: {result.source}</span>
          </>
        )}
      </div>
      <p className="text-xs text-[var(--text-subtle)] leading-relaxed border-t border-[var(--border)] pt-3">
        {result.disclaimer}
      </p>
    </div>
  );
}
