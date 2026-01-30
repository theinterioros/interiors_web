import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Role } from "@/lib/types";
import HeaderNav from "./HeaderNav";

type SessionUser = {
  id: string;
  email: string;
  role: Role;
  name: string | null;
};

export default function SiteHeader({ user }: { user: SessionUser | null }) {
  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "FIRM"
        ? "/firm/dashboard"
        : user?.role === "CUSTOMER"
          ? "/customer/dashboard"
          : null;

  return (
    <header className="sticky top-0 z-50 h-[var(--header-height)] flex flex-col justify-center border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
      <div className="page-inner">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--foreground)] text-sm font-semibold text-white shrink-0">
              IO
            </div>
            <span className="text-sm font-semibold text-[var(--foreground)] truncate">Interior OS</span>
          </Link>
          <HeaderNav user={user} dashboardHref={dashboardHref} logoutAction={logoutAction} />
        </div>
      </div>
    </header>
  );
}
