import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers for all responses + legacy /firm -> /designer redirect.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response: NextResponse;

  if (pathname.startsWith("/firm")) {
    const newPath = (pathname.replace(/^\/firm/, "/designer") || "/designer") + request.nextUrl.search;
    response = NextResponse.redirect(new URL(newPath, request.url));
  } else {
    response = NextResponse.next();
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)"],
};
