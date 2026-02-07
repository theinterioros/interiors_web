"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";
import type { Role } from "@/lib/types";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

function isAuthPath(path: string | null) {
  if (!path) return false;
  return AUTH_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

type SessionUser = { id: string; email: string; role: Role; name: string | null } | null;

export default function AuthAwareLayout({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = isAuthPath(pathname);

  return (
    <>
      {!hideHeader && <SiteHeader user={user} pathname={pathname} />}
      <main
        id="main-content"
        className="min-w-0"
        style={hideHeader ? undefined : { paddingTop: "var(--header-height)" }}
      >
        {children}
      </main>
    </>
  );
}
