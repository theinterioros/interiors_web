import { Mail, MessageSquare, Phone, User } from "lucide-react";
import { sql } from "@/lib/db";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await sql<{
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string | null;
    created_at: Date;
  }>`
    select id, name, email, phone, message, created_at
    from contact_leads
    order by created_at desc
  `;

  return (
    <div>
      <FadeIn className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Get in touch</p>
        </div>
        <h1 className="heading-lg mb-3">Contact leads</h1>
        <p className="text-[var(--text-muted)]">
          People who submitted the contact form on the landing page. Follow up via email or phone.
        </p>
      </FadeIn>

      {leads.length === 0 ? (
        <FadeIn>
          <div className="card text-center text-[var(--text-muted)]">
            No leads yet. Submissions from the Get in touch form will appear here.
          </div>
        </FadeIn>
      ) : (
        <StaggerChildren className="space-y-4">
          {leads.map((lead) => (
            <FadeInItem key={lead.id}>
              <div className="card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                      <span className="font-semibold text-[var(--foreground)]">{lead.name}</span>
                    </div>
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-2 text-sm text-[var(--brand)] hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {lead.email}
                    </a>
                    <a
                      href={`tel:${lead.phone.replace(/\D/g, "")}`}
                      className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {lead.phone}
                    </a>
                    {lead.message ? (
                      <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                        <MessageSquare className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{lead.message}</p>
                      </div>
                    ) : null}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] shrink-0">
                    {new Date(lead.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </FadeInItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
