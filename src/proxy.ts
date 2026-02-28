import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirect legacy /firm/* to /designer/*. Designers use /designer only.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/firm")) {
    const newPath = (pathname.replace(/^\/firm/, "/designer") || "/designer") + request.nextUrl.search;
    return NextResponse.redirect(new URL(newPath, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/firm", "/firm/:path*"],
};
