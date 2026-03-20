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

/** Use in firm portal pages. Redirects to renew/pay page if designer subscription is missing or expired. */
export async function requireFirmPaid() {
  const user = await requireRole(["FIRM"]);
  const paid = await hasFirmPaidRegistration(user.id);
  if (paid) return user;
  redirect("/designer/renew");
}

/** Use in customer portal pages that require login. Registration is free now. */
export async function requireCustomerPaid() {
  const user = await requireRole(["CUSTOMER"]);
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
