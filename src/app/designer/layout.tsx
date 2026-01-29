import { ReactNode } from "react";
import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth";

export default async function DesignerLayout({ children }: { children: ReactNode }) {
  await requireRole([Role.DESIGNER]);
  return <>{children}</>;
}
