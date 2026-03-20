import Link from "next/link";
import { getAdminSettings } from "@/lib/settings";

export default async function TermsPage() {
  const settings = await getAdminSettings();
  const contactEmail = settings.contactEmail ?? "support@interioros.com";
  const contactAddress = settings.contactAddress ?? "Interior OS, India";

  return (
    <div className="page">
      <div className="page-inner max-w-3xl">
        <h1 className="heading-lg mb-4">Terms of Service</h1>

        <div className="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            These Terms of Service (“Terms”) govern your access to and use of Interior OS (“Platform”).
            By using the Platform, you agree to these Terms.
          </p>
          <p>
            The Platform provides tools to help estimate interior design budgets, connect with verified interior
            designers/firms, and manage project milestones. Any estimates shown are approximate and based on
            average market pricing; final costs may vary based on site conditions, design complexity, materials,
            and labor.
          </p>
          <p>
            You are responsible for providing accurate information. We may suspend or terminate access if we detect
            misuse or activity that violates these Terms.
          </p>
          <p>
            Questions? Contact us at{" "}
            <a href={`mailto:${contactEmail}`} className="text-[var(--brand)] hover:underline">
              {contactEmail}
            </a>{" "}
            or visit{" "}
            <Link href="/contact" className="text-[var(--brand)] hover:underline">
              Contact Us
            </Link>
            .
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/30 p-5">
          <p className="text-sm font-semibold text-[var(--foreground)]">Contact</p>
          <p className="text-sm text-[var(--text-muted)]">
            {contactAddress}
            <br />
            <a href={`mailto:${contactEmail}`} className="text-[var(--brand)] hover:underline">
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

