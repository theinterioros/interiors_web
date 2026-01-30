import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export default function DigitalTwinMarketingPage() {
  return (
    <div className="page bg-white">
      <div className="page-inner">
        <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Digital Twin</p>
          </div>
          <h1 className="heading-lg mb-3">Your home&apos;s records, secured.</h1>
          <p className="text-[var(--text-muted)]">
            Store wiring diagrams, plumbing layouts, floor plans, and final handover documents in one
            secure place. Free for the first year, ₹1000/year after.
          </p>
        </FadeIn>

        <StaggerChildren className="grid gap-4 md:grid-cols-2 mb-8">
          <FadeInItem>
            <div className="card">
              <h3 className="heading-md mb-2">Always accessible</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Access documents anytime for maintenance, resale, or renovations.
              </p>
            </div>
          </FadeInItem>
          <FadeInItem>
            <div className="card">
              <h3 className="heading-md mb-2">Secure cloud storage</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Files are stored on Vercel Blob with access controls for customers.
              </p>
            </div>
          </FadeInItem>
        </StaggerChildren>

        <FadeIn delay={0.3}>
          <Link href="/login" className="btn btn-primary">
            Sign in to view your digital twin
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}
