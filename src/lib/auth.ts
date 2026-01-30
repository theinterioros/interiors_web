import { redirect } from "next/navigation";
import { Role } from "@/lib/types";
import { getSessionUser } from "@/lib/session";
import { hasFirmPaidRegistration } from "@/lib/registrationPayments";

export async function getCurrentUser() {
  return getSessionUser();
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }
  return user;
}

/** Use in firm portal pages. Redirects to pay page if firm has not paid registration. */
export async function requireFirmPaid() {
  const user = await requireRole(["FIRM"]);
  const paid = await hasFirmPaidRegistration(user.id);
  if (!paid) {
    redirect("/firm/register/pay");
  }
  return user;
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
