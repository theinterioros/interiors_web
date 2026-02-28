import { redirect } from "next/navigation";

export default function AdminDesignersPendingPaymentPage() {
  redirect("/admin/designers?status=PENDING_REGISTRATION");
}
