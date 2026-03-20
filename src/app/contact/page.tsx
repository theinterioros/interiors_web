import { getAdminSettings } from "@/lib/settings";
import ContactForm from "@/components/landing/ContactForm";
import { Info, Mail, MapPin, PhoneCall } from "lucide-react";

export default async function ContactPage() {
  const settings = await getAdminSettings();
  const contactEmail = settings.contactEmail ?? "support@interioros.com";
  const contactPhone = settings.contactPhone ?? null;
  const contactAddress = settings.contactAddress ?? "Interior OS, India";

  return (
    <div className="page">
      <div className="page-inner max-w-4xl">
        <div className="mb-6">
          <h1 className="heading-lg mb-2">Contact Us</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Reach out for partnership, support, or to talk about a project.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-[var(--brand)]" />
              <p className="font-semibold">Direct contact</p>
            </div>

            <div className="space-y-3 text-sm text-[var(--text-muted)]">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-[var(--text-muted)] mt-0.5" />
                <a href={`mailto:${contactEmail}`} className="text-[var(--brand)] hover:underline">
                  {contactEmail}
                </a>
              </div>
              {contactPhone ? (
                <div className="flex items-start gap-2">
                  <PhoneCall className="h-4 w-4 text-[var(--text-muted)] mt-0.5" />
                  <a
                    href={`tel:${contactPhone.replace(/\D/g, "")}`}
                    className="text-[var(--brand)] hover:underline"
                  >
                    {contactPhone}
                  </a>
                </div>
              ) : null}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[var(--text-muted)] mt-0.5" />
                <span>{contactAddress}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-5">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

