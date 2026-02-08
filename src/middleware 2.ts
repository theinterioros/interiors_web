import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirect /designer/* to /firm/* so designers use a single portal.
 * Fixes 404 when viewing ACCEPTED projects from designer dashboard.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/designer")) {
    const newPath = pathname.replace(/^\/designer/, "/firm");
    return NextResponse.redirect(new URL(newPath + request.nextUrl.search, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/designer/:path*"],
};
