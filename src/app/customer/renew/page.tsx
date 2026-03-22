import Link from "next/link";
import { Cuboid } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerRenewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect("/login?role=customer");
  }

  return (
    <div className="page">
      <div className="page-inner">
        <div className="mx-auto max-w-md">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
                <Cuboid className="h-6 w-6" />
              </div>
              <div>
                <p className="eyebrow">Digital Twin</p>
                <h1 className="heading-md">Unlocked</h1>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Customers currently do not have any subscription fees. Digital Twin access is available without payment.
            </p>
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              <Link href="/customer/digital-twin" className="font-medium text-[var(--brand)] hover:underline">
                Back to Digital Twin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
