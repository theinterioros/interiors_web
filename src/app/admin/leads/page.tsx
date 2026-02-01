import { sql } from "@/lib/db";
import AdminLeadsContent, { type ContactLead, type EstimatorLead } from "./AdminLeadsContent";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const [contactLeads, estimatorLeads] = await Promise.all([
    sql<ContactLead>`
      select id, name, email, phone, message, created_at
      from contact_leads
      order by created_at desc
    `,
    sql<EstimatorLead>`
      select id, name, email, phone, city, pincode, square_feet, property_type, rooms, min_amount, max_amount, created_at
      from estimator_leads
      order by created_at desc
    `,
  ]);

  return (
    <AdminLeadsContent contactLeads={contactLeads} estimatorLeads={estimatorLeads} />
  );
}
