import { NextRequest, NextResponse } from "next/server";

// Routes that are reachable without authentication.
const PUBLIC_PATHS = [
  "/auth/signin",
  "/auth/forgot-password",
  "/auth/reset-password",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Authenticated users hitting an auth page get sent to the dashboard.
  if (token && isPublic(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated users may only reach public (auth) pages.
  if (!token && !isPublic(pathname)) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
