import Link from "next/link";

export default function DigitalTwinMarketingPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Digital Twin</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Your home’s records, secured.</h1>
          <p className="text-sm text-neutral-500">
            Store wiring diagrams, plumbing layouts, floor plans, and final handover documents in one
            secure place. Free for the first year, ₹1000/year after.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900">Always accessible</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Access documents anytime for maintenance, resale, or renovations.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900">Secure cloud storage</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Files are stored on Vercel Blob with access controls for customers.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex rounded-md bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Sign in to view your digital twin
        </Link>
      </div>
    </div>
  );
}
