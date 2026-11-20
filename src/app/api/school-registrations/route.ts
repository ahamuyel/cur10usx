import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"

const registerLimiter = rateLimit({ maxRequests: 3, windowMs: 60 * 60 * 1000, key: "school-registrations" })

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    if (session.user.twoFactorEnabled && !session.user.twoFactorVerifiedAt) {
      return NextResponse.json({ error: "Verificação em dois passos necessária" }, { status: 403 })
    }

    const ip = getIp(req)
    const limit = await registerLimiter(ip)
    if (!limit.success) {
      return NextResponse.json({ error: "Demasiadas tentativas. Tente novamente mais tarde." }, { status: 429 })
    }

    // Only unaffiliated students may found a school
    if (session.user.role !== "student" || session.user.schoolId) {
      return NextResponse.json({ error: "Sem permissão para registar uma escola" }, { status: 403 })
    }

    const { name, email, phone, address, city, provincia, nif } = await req.json()
    const slug = toSlug(name)

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Nome, e-mail e telefone são obrigatórios" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 })
    }

    // Re-check against fresh DB state — the session may be stale
    if (user.role !== "student" || user.schoolId) {
      return NextResponse.json({ error: "Sem permissão para registar uma escola" }, { status: 403 })
    }

    const existingSlug = await prisma.school.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: "Já existe uma escola com este nome. Escolha outro nome." }, { status: 409 })
    }

    const school = await prisma.school.create({
      data: {
        name,
        slug,
        email,
        phone,
        address: address || "",
        city: city || "",
        provincia: provincia || "",
        nif: nif || null,
        status: "pendente",
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { schoolId: school.id, role: "school_admin" },
    })

    return NextResponse.json({ schoolId: school.id, schoolName: school.name }, { status: 201 })
  } catch (error) {
    console.error("[School Registration Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
