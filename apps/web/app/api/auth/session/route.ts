import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from "@/lib/authSession"

type SessionPayload = {
    token?: string
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as SessionPayload
        const token = typeof body?.token === "string" ? body.token : ""
        if (!token) {
            return NextResponse.json({ message: "Missing token" }, { status: 400 })
        }

        const cookieStore = await cookies()
        cookieStore.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
        })

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 })
    }
}

export async function DELETE() {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    return NextResponse.json({ ok: true }, { status: 200 })
}
