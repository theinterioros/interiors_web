import { redirect } from "next/navigation";

export default function CancellationPolicyRedirectPage() {
  redirect("/refund-policy");
}

