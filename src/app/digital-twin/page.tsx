import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function DigitalTwinMarketingPage() {
  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            Digital Twin
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">Your home’s records, secured.</h1>
          <p className="text-sm text-neutral-500">
            Store wiring diagrams, plumbing layouts, floor plans, and final handover documents in one
            secure place. Free for the first year, ₹1000/year after.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-900">Always accessible</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Access documents anytime for maintenance, resale, or renovations.
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-900">Secure cloud storage</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Files are stored on Vercel Blob with access controls for customers.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:from-amber-400 hover:to-amber-500"
        >
          Sign in to view your digital twin
        </Link>
      </div>
    </div>
  );
}
