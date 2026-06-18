import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/sudocle", request.url), 302)
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/",
}
