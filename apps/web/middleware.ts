import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/authSession"

const protectedPaths = ["/post-blogs", "/user-profile", "/user-settings"]

function isProtectedPath(pathname: string): boolean {
    return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const hasSession = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value)

    if (pathname === "/auth" && hasSession) {
        return NextResponse.redirect(new URL("/home", req.url))
    }

    if (isProtectedPath(pathname) && !hasSession) {
        return NextResponse.redirect(new URL("/auth", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/auth", "/post-blogs/:path*", "/user-profile/:path*", "/user-settings/:path*"],
}
