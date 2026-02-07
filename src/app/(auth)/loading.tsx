export default function AuthLoading() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#fafbfc]"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center">
        <div
          className="h-10 w-10 rounded-full border-2 border-[var(--brand)]/30 border-t-[var(--brand)] animate-spin"
          role="status"
          aria-label="Loading"
        />
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading...</p>
      </div>
    </div>
  );
}
