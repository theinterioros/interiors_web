import { ReactNode } from "react";
import { RoleValues } from "@/lib/types";
import { requireRole } from "@/lib/auth";
import { getPendingActionsForUser } from "@/lib/pendingActions";
import AppSidebar from "@/components/layout/AppSidebar";
import PendingActionsBanner from "@/components/layout/PendingActionsBanner";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const user = await requireRole([RoleValues.CUSTOMER]);
  const pendingActions = await getPendingActionsForUser(user.id, user.role);
  return (
    <>
      <AppSidebar role="customer" />
      <div className="md:pl-[260px] min-h-[calc(100vh-var(--header-height))] bg-[var(--surface-subtle)]">
        <PendingActionsBanner items={pendingActions} />
        <div className="page-inner mx-auto w-full max-w-6xl min-w-0 py-6 sm:py-8">
          {children}
        </div>
      </div>
    </>
  );
}
