import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { RoleValues } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Platform margin is fixed at 5% for all designers. Redirect to designer approvals. */
export default async function AdminMarginRequestsPage() {
  await requireRole([RoleValues.ADMIN]);
  redirect("/admin/designers");
}
