import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { RoleValues } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Margin approvals are now in Designer approvals → Margin approval tab. */
export default async function AdminMarginRequestsPage() {
  await requireRole([RoleValues.ADMIN]);
  redirect("/admin/designers?status=MARGIN_APPROVAL");
}
