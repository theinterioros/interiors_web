import Link from "next/link";
import { Lock } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";

export default function UnauthorizedPage() {
  return (
    <div className="page bg-white">
      <div className="page-inner max-w-md mx-auto text-center">
        <FadeIn>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lock className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Restricted</p>
          </div>
          <h1 className="heading-lg mb-3">Access restricted</h1>
          <p className="text-[var(--text-muted)] mb-6">
            You do not have permission to view this page.
          </p>
          <Link href="/" className="btn btn-secondary">
            Return to home
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}
