import { NextRequest, NextResponse } from "next/server";
const PUBLIC_FILE = /\.(.*)$/;
const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and static files
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest") ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) return NextResponse.next();

  // Check for Supabase auth cookies (various possible names)
  const cookieNames = Array.from(req.cookies.getAll()).map(c => c.name);
  const hasSupabaseCookie = cookieNames.some(name =>
    name.startsWith("sb-") && (
      name.includes("-auth-token") ||
      name.includes("access-token") ||
      name.includes("refresh-token")
    )
  );

  if (!hasSupabaseCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!api/auth|_next|.*\..*).*)"] };
