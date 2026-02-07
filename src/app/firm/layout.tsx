import { ReactNode } from "react";
import { RoleValues } from "@/lib/types";
import { requireRole } from "@/lib/auth";

export default async function FirmLayout({ children }: { children: ReactNode }) {
  await requireRole([RoleValues.FIRM]);
  return (
    <div className="min-h-screen bg-[var(--surface-subtle)] page-gradient-app">
      {children}
    </div>
  );
}
