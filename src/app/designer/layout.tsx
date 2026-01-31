import { ReactNode } from "react";
import { RoleValues } from "@/lib/types";
import { requireRole } from "@/lib/auth";

export default async function DesignerLayout({ children }: { children: ReactNode }) {
  await requireRole([RoleValues.DESIGNER]);
  return <>{children}</>;
}
