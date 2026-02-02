// proxy.ts (or middleware.ts depending on your config)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Ensure you use the 'export' keyword explicitly
// 2. The function name should ideally match 'middleware' or 'proxy'
export default function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isRootPath = pathname === "/";
  const isChatPath = pathname.startsWith("/chat");

  // Logic
  if (isChatPath && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isRootPath && token) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

// 3. This must be a named export
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};