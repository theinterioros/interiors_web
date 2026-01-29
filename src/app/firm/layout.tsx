import { ReactNode } from "react";
import { RoleValues } from "@/lib/types";
import { requireRole } from "@/lib/auth";

export default async function FirmLayout({ children }: { children: ReactNode }) {
  await requireRole([RoleValues.FIRM]);
  return <>{children}</>;
}
