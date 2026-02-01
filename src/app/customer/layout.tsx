import { ReactNode } from "react";
import { RoleValues } from "@/lib/types";
import { requireRole } from "@/lib/auth";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  await requireRole([RoleValues.CUSTOMER]);
  return (
    <div className="min-h-screen page-gradient-app -mt-[var(--header-height)] pt-[var(--header-height)]">
      {children}
    </div>
  );
}
