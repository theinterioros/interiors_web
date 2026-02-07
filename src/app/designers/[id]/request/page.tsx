import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireCustomerPaid } from "@/lib/auth";
import RequestProjectForm from "@/components/customer/RequestProjectForm";
import { ADDITIONAL_PROJECT_FEE_AMOUNT } from "@/lib/registrationPayments";

export const dynamic = "force-dynamic";

export default async function DesignerRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: profileId } = await params;
  const user = await requireCustomerPaid();

  const [firm] = await sql<{
    user_id: string;
    firm_name: string | null;
    name: string | null;
    status: string;
    margin_accepted_at: Date | null;
  }>`
    select user_id, firm_name, name, status, margin_accepted_at
    from firm_profiles
    where id = ${profileId}
    limit 1
  `;

  if (!firm) {
    redirect("/designers");
  }
  if (firm.status !== "APPROVED" || !firm.margin_accepted_at) {
    redirect(`/designers/${profileId}`);
  }

  const firmName = firm.firm_name ?? firm.name ?? "Designer";

  return (
    <div className="page bg-white">
      <div className="page-inner max-w-2xl">
        <RequestProjectForm
          firmId={firm.user_id}
          profileId={profileId}
          firmName={firmName}
          additionalProjectFeeAmount={ADDITIONAL_PROJECT_FEE_AMOUNT}
        />
      </div>
    </div>
  );
}
