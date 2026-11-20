import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit"
import speakeasy from "speakeasy"

const verifyIpLimiter = rateLimit({ maxRequests: 5, windowMs: 5 * 60 * 1000, key: "2fa-verify-ip" })
const verifyUserLimiter = rateLimit({ maxRequests: 5, windowMs: 5 * 60 * 1000, key: "2fa-verify-user" })

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // 2FA must be enabled but not yet verified for this endpoint to be relevant
    if (!session.user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA não está ativado" }, { status: 400 })
    }
    if (session.user.twoFactorVerifiedAt) {
      return NextResponse.json({ error: "2FA já verificado" }, { status: 400 })
    }

    // Rate limiting by IP and by User ID
    const ip = getIp(req)
    const ipLimit = await verifyIpLimiter(ip)
    if (!ipLimit.success) {
      return NextResponse.json({ error: "Demasiadas tentativas. Tente novamente mais tarde." }, { status: 429 })
    }
    const userLimit = await verifyUserLimiter(session.user.id)
    if (!userLimit.success) {
      return NextResponse.json({ error: "Demasiadas tentativas nesta conta. Tente novamente mais tarde." }, { status: 429 })
    }

    const { token } = await req.json()
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    })

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA não configurado" }, { status: 400 })
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    })

    if (!verified) {
      await logAudit({
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        userRole: session.user.role || "unknown",
        action: "LOGIN",
        entity: "2FA",
        description: "Tentativa de verificação 2FA falhada",
        ipAddress: ip,
      })
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorVerifiedAt: new Date(),
      },
    })

    await logAudit({
      userId: session.user.id,
      userName: session.user.name || "Unknown",
      userRole: session.user.role || "unknown",
      action: "LOGIN",
      entity: "2FA",
      description: "Verificação 2FA concluída com sucesso",
      ipAddress: ip,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao verificar 2FA" }, { status: 500 })
  }
}
