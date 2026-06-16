import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

const authPages = ["/signin", "/signup", "/forgot-password", "/registar-escola"]
const alwaysAccessible = ["/reset-password", "/verify-email", "/signin/verify-2fa"]
const publicPaths = ["/", "/aplicacao", "/aplicacao/status", "/maintenance", "/termos", "/privacidade"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public paths — always accessible
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // API routes — auth is enforced per-route via requireRole/requirePermission
  const publicApiPrefixes = ["/api/auth/", "/api/applications/status", "/api/platform/status", "/api/schools/public", "/api/health"]
  if (pathname.startsWith("/api/")) {
    if (publicApiPrefixes.some((p) => pathname.startsWith(p))) {
      return NextResponse.next()
    }
    const hasSession =
      req.cookies.has("authjs.session-token") ||
      req.cookies.has("next-auth.session-token")
    if (!hasSession) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (alwaysAccessible.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const session = await auth()
  const hasSessionCookie = !!session

  // Auth pages — redirect to minha-area if already logged in
  if (authPages.some((p) => pathname.startsWith(p))) {
    if (hasSessionCookie) {
      const storedCallbackUrl = req.cookies.get("next-auth-callback-url")?.value
      if (storedCallbackUrl && isValidRedirect(storedCallbackUrl)) {
        const response = NextResponse.redirect(new URL(storedCallbackUrl, req.url))
        response.cookies.set("next-auth-callback-url", "", { maxAge: 0, path: "/" })
        return response
      }
      return NextResponse.redirect(new URL("/minha-area", req.url))
    }
    return NextResponse.next()
  }

  // Not logged in — redirect to signin
  if (!hasSessionCookie) {
    const signinUrl = new URL("/signin", req.url)
    signinUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signinUrl)
  }

  // Role-based redirects and dashboard access control
  if (session?.user) {
    const { role, id } = session.user

    // Super Admin should go to /admin
    if (role === "super_admin" && !pathname.startsWith("/admin") && !pathname.startsWith("/minha-area")) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }

    // Dashboard access control
    if (pathname.startsWith("/dashboard/")) {
      const pathId = pathname.split("/")[2]
      if (role !== "school_admin" && pathId !== id) {
        return NextResponse.redirect(new URL(`/dashboard/${id}`, req.url))
      }
    }
  }

  return NextResponse.next()
}

// Safe redirect validation
function isValidRedirect(url: string): boolean {
  if (!url.startsWith("/")) return false
  if (url.startsWith("//")) return false
  if (url.includes("@")) return false
  if (url.includes("..")) return false
  return true
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data|_next/font|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
}
