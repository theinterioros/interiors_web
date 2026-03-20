import Link from "next/link";
import { getAdminSettings } from "@/lib/settings";

export default async function RefundPolicyPage() {
  const settings = await getAdminSettings();
  const contactEmail = settings.contactEmail ?? "support@interioros.com";

  return (
    <div className="page">
      <div className="page-inner max-w-3xl">
        <h1 className="heading-lg mb-4">Refund / Cancellation Policy</h1>

        <div className="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            Interior OS provides budgeting tools and an escrow-based workflow for approved projects and
            milestone payments. Where payments are involved, the Platform follows the relevant payment terms
            and Razorpay’s payment processing rules.
          </p>
          <p>
            Requests for refunds/cancellations are handled case-by-case depending on the stage of the project
            and the nature of the service delivered. In general, estimates and digital content provided through
            the Platform are informational and approximate; final outcomes and costs may vary.
          </p>
          <p>
            If you need help with a payment or cancellation request, contact us at{" "}
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

