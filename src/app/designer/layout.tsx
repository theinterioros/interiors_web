import { ReactNode } from "react";
import { RoleValues } from "@/lib/types";
import { requireFirmPaid } from "@/lib/auth";

export default async function DesignerLayout({ children }: { children: ReactNode }) {
  await requireFirmPaid();
  return <>{children}</>;
}
