import { ReactNode } from "react";
import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole([Role.ADMIN]);
  return <>{children}</>;
}
