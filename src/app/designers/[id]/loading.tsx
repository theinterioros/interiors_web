export default function DesignerProfileLoading() {
  return (
    <div className="page bg-white">
      <div className="page-inner">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[var(--border)] rounded" />
          <div className="h-4 w-full max-w-md bg-[var(--border)] rounded" />
          <div className="h-4 w-full max-w-lg bg-[var(--border)] rounded" />
        </div>
      </div>
    </div>
  );
}
