import Link from "next/link";
import { getAdminSettings } from "@/lib/settings";

export default async function PrivacyPage() {
  const settings = await getAdminSettings();
  const contactEmail = settings.contactEmail ?? "support@interioros.com";

  return (
    <div className="page">
      <div className="page-inner max-w-3xl">
        <h1 className="heading-lg mb-4">Privacy Policy</h1>

        <div className="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            This Privacy Policy explains how Interior OS (“Platform”) collects, uses, and protects information.
          </p>
          <p>
            We may collect information you provide when creating an account, requesting an estimate, submitting a
            contact form, or interacting with the Platform. We use this information to operate the Platform, process
            payments where applicable, and communicate with you.
          </p>
          <p>
            We do not sell your personal data. We take reasonable security measures, but no method of transmission or
            storage is 100% secure.
          </p>
          <p>
            For questions about this policy, contact us at{" "}
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
      </div>
    </div>
  );
}

