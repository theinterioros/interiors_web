import { addTrustedStudioAction, deleteTrustedStudioAction } from "@/app/actions/admin";
import { getTrustedStudios } from "@/lib/trustedStudios";
import { Building2, Trash2 } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";

export const dynamic = "force-dynamic";

const LOGO_BG_OPTIONS = [
  { value: "bg-[var(--foreground)]", label: "Foreground" },
  { value: "bg-[var(--brand)]", label: "Brand" },
  { value: "bg-[var(--accent-teal)]", label: "Teal" },
  { value: "bg-[var(--accent-amber)]", label: "Amber" },
  { value: "bg-[var(--accent-emerald)]", label: "Emerald" },
  { value: "bg-[var(--foreground)]/80", label: "Foreground 80%" },
];

type PageProps = { searchParams?: Promise<{ error?: string }> };

export default async function AdminTrustedStudiosPage({ searchParams }: PageProps) {
  const studios = await getTrustedStudios();
  const params = await searchParams;
  const error = params?.error;

  return (
    <div>
      <FadeIn className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Trusted Studios</p>
        </div>
        <h1 className="heading-lg mb-3">Trusted by Growing studios</h1>
        <p className="text-[var(--text-muted)]">
          These items appear on the landing page under &quot;Trusted by Growing studios&quot;. Add or remove entries.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2" role="alert">
            {decodeURIComponent(error)}
          </p>
        )}
        <form action={addTrustedStudioAction} className="card mb-8">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Add studio</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Name</label>
              <input name="name" type="text" required placeholder="e.g. Studio Maple" className="input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Mark (2–4 letters)</label>
              <input name="mark" type="text" required placeholder="e.g. SM" maxLength={4} className="input uppercase" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Logo background</label>
              <select name="logoBg" className="input">
                {LOGO_BG_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn btn-primary w-full sm:w-auto">Add</button>
            </div>
          </div>
        </form>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="card">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Current studios ({studios.length})</h2>
          {studios.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No studios yet. Add one above.</p>
          ) : (
            <ul className="space-y-2">
              {studios.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.logoBg} text-white text-xs font-semibold`}
                    >
                      {s.mark}
                    </div>
                    <span className="font-medium text-[var(--foreground)] truncate">{s.name}</span>
                  </div>
                  <form action={deleteTrustedStudioAction} className="shrink-0">
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label={`Remove ${s.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
