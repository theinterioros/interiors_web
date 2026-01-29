import { ReactNode } from "react";
import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  await requireRole([Role.CUSTOMER]);
  return <>{children}</>;
}
