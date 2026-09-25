import { NextResponse, type NextRequest } from "next/server";

// Server components can't see the request path, so pass it along. pageSession() uses it
// to send signed-out visitors to /login?next=<the page they wanted>. No auth decisions here:
// those happen in pageSession() and the feature services, against the database.
export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!api|_next|icon.svg|favicon.ico).*)"] };
