"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, User } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

export type ContactLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  created_at: Date;
};

export type EstimatorLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  pincode: string;
  square_feet: number;
  property_type: string | null;
  rooms: number | null;
  min_amount: number;
  max_amount: number;
  created_at: Date;
};

function ContactLeadsList({ leads }: { leads: ContactLead[] }) {
  return leads.length === 0 ? (
    <div className="card text-center text-[var(--text-muted)]">
      No Contact Form leads yet. Submissions from the Get in touch form will appear here.
    </div>
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
  );
}

function EstimatorLeadsList({ leads }: { leads: EstimatorLead[] }) {
  return leads.length === 0 ? (
    <div className="card text-center text-[var(--text-muted)]">
      No AI Estimator leads yet. Estimates from the landing page will appear here.
    </div>
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
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {lead.phone}
                  </a>
                ) : null}
                <p className="text-sm text-[var(--text-muted)]">
                  {lead.city} · {lead.pincode} · {lead.square_feet} sq ft
                  {lead.property_type ? ` · ${lead.property_type}` : ""}
                  {lead.rooms != null ? ` · ${lead.rooms} room(s)` : ""}
                </p>
                <p className="text-sm font-semibold text-[var(--brand)]">
                  ₹{lead.min_amount.toLocaleString()} – ₹{lead.max_amount.toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-[var(--text-muted)] shrink-0">
                {new Date(lead.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </FadeInItem>
      ))}
    </StaggerChildren>
  );
}

export default function AdminLeadsContent({
  contactLeads,
  estimatorLeads,
}: {
  contactLeads: ContactLead[];
  estimatorLeads: EstimatorLead[];
}) {
  const [tab, setTab] = useState<"contact" | "estimator">("contact");

  return (
    <div>
      <FadeIn className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-[var(--brand)]" />
          <p className="eyebrow">Get in touch</p>
        </div>
        <h1 className="heading-lg mb-3">Leads</h1>
        <p className="text-[var(--text-muted)]">
          Contact form submissions and AI Cost Estimator queries. Follow up via email or phone.
        </p>
      </FadeIn>

      <div className="flex gap-2 border-b border-[var(--border)] mb-6">
        <button
          type="button"
          onClick={() => setTab("contact")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "contact"
              ? "border-[var(--brand)] text-[var(--brand)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Contact Form ({contactLeads.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("estimator")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "estimator"
              ? "border-[var(--brand)] text-[var(--brand)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          AI Estimator ({estimatorLeads.length})
        </button>
      </div>

      {tab === "contact" ? (
        <ContactLeadsList leads={contactLeads} />
      ) : (
        <EstimatorLeadsList leads={estimatorLeads} />
      )}
    </div>
  );
}
