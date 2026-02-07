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

const APP_ROUTES = ["/admin", "/customer", "/firm", "/designers"];

function isAppRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return APP_ROUTES.some((base) => pathname === base || pathname.startsWith(base + "/"));
}

export default function SiteHeader({
  user,
  pathname = null,
}: {
  user: SessionUser | null;
  pathname?: string | null;
}) {
  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "FIRM"
        ? "/firm/dashboard"
        : user?.role === "CUSTOMER"
          ? "/customer/dashboard"
          : null;
  const appChrome = isAppRoute(pathname);
  return (
    <header
      className={
        "fixed top-0 left-0 right-0 z-50 h-[var(--header-height)] flex flex-col justify-center border-b border-[var(--border)] min-w-0 overflow-x-hidden " +
        (appChrome ? "bg-white" : "bg-white/95 backdrop-blur-md")
      }
    >
      <div className={appChrome ? "w-full px-4 sm:px-6 min-w-0" : "page-inner min-w-0"}>
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--foreground)] text-sm font-semibold text-white shrink-0">
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
