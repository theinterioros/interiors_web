import { ReactNode } from "react";
import { RoleValues } from "@/lib/types";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole([RoleValues.ADMIN]);
  return (
    <div className="min-h-screen bg-[var(--surface-subtle)] -mt-[var(--header-height)] pt-[var(--header-height)]">
      <div className="mx-auto max-w-5xl w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
