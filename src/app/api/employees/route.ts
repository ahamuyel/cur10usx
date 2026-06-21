import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { buildOrderBy } from "@/lib/query-helpers"
import { logAudit, auditUser } from "@/lib/audit"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      "canManageEmployees",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""

    const where: Record<string, unknown> = {
      schoolId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(role ? { role } : {}),
    }

    const orderBy = buildOrderBy(searchParams, ["name", "role", "department", "createdAt"], { name: "asc" })

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, isActive: true } },
        },
      }),
      prisma.employee.count({ where }),
    ])

    const mapped = data.map((e) => ({
      ...e,
      hasAccount: !!e.userId,
      userActive: e.user?.isActive ?? null,
    }))

    return NextResponse.json({ data: mapped, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageEmployees", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const { name, email, phone, address, role, department } = body

    if (!name || !role) {
      return NextResponse.json({ error: "Nome e função são obrigatórios" }, { status: 400 })
    }

    if (!["secretaria", "tesouraria", "biblioteca", "recursos_humanos", "coordenacao", "direcao", "outros"].includes(role)) {
      return NextResponse.json({ error: "Função inválida" }, { status: 400 })
    }

    if (email) {
      const existingEmail = await prisma.employee.findUnique({ where: { email } })
      if (existingEmail) {
        return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 409 })
      }
    }

    let userId: string | null = null
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        const existingLinked = await prisma.employee.findFirst({ where: { userId: existingUser.id } })
        if (!existingLinked) {
          userId = existingUser.id
        }
      }
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        role,
        department: department || null,
        schoolId,
        ...(userId ? { userId } : {}),
      },
    })

    logAudit({
      ...auditUser(session!),
      action: "CREATE",
      entity: "Employee",
      entityId: employee.id,
      schoolId,
      description: `Funcionário ${name} criado com função ${role}`,
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
