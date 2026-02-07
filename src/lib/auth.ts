import { redirect } from "next/navigation";
import { Role } from "@/lib/types";
import { getSessionUser } from "@/lib/session";
import { hasFirmPaidRegistration } from "@/lib/registrationPayments";

export async function getCurrentUser() {
  return getSessionUser();
}

/** Role slug for login page: admin, designer (firm), or customer */
function loginRoleParam(allowedRoles: Role[]): string {
  if (allowedRoles.includes("ADMIN")) return "admin";
  if (allowedRoles.includes("FIRM")) return "designer";
  return "customer";
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?role=${loginRoleParam(allowedRoles)}`);
  }
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }
  return user;
}

/** Use in firm portal pages. Allows access before payment until margin is accepted; then redirects to pay if not paid. */
export async function requireFirmPaid() {
  const user = await requireRole(["FIRM"]);
  const paid = await hasFirmPaidRegistration(user.id);
  if (paid) return user;
  const { sql } = await import("@/lib/db");
  const [profile] = await sql<{ margin_accepted_at: Date | null }>`
    select margin_accepted_at from firm_profiles where user_id = ${user.id} limit 1
  `;
  // If margin not yet accepted, allow access (designer can declare margin and accept on dashboard).
  if (profile?.margin_accepted_at == null) return user;
  redirect("/firm/register/pay");
}

/** Use in customer portal pages that require subscription. Redirects to subscribe page if not paid. */
export async function requireCustomerPaid() {
  const user = await requireRole(["CUSTOMER"]);
  const { hasCustomerPaidSubscription } = await import("@/lib/registrationPayments");
  const paid = await hasCustomerPaidSubscription(user.id);
  if (!paid) {
    redirect("/customer/subscribe");
  }
  return user;
}

export function roleLabel(role: Role) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "FIRM":
      return "Firm";
    case "CUSTOMER":
      return "Customer";
    default:
      return "User";
  }
}
