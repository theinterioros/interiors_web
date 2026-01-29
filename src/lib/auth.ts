import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma";
import { getSessionUser } from "@/lib/session";

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

export function roleLabel(role: Role) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "DESIGNER":
      return "Designer";
    case "CUSTOMER":
      return "Customer";
    default:
      return "User";
  }
}
