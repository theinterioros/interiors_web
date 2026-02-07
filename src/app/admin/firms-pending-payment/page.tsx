import { redirect } from "next/navigation";

export default function AdminFirmsPendingPaymentPage() {
  redirect("/admin/designers?status=PENDING_REGISTRATION");
}
