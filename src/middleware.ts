import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic redirect only (UX): no cookie => /login. This is NOT authorization.
 * Every page and server action re-validates the session and permissions against the database.
 */
export function middleware(req: NextRequest) {
  const name = process.env.NODE_ENV === "production" ? "__Host-sl_session" : "sl_session";
  if (!req.cookies.has(name)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!login|api/health|_next/static|_next/image|favicon.ico).*)"] };
