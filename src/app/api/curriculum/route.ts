import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { createCurriculumSchema } from "@/lib/validations/academic"
import { buildOrderBy } from "@/lib/query-helpers"

export async function GET(req: Request) {
  try {
    const { error: authError } = await requirePermission(["school_admin", "teacher"], "canManageSubjects")
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { version: { contains: search, mode: "insensitive" as const } },
              { country: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const orderBy = buildOrderBy(searchParams, ["name", "createdAt"], { name: "asc" })

    const [data, total] = await Promise.all([
      prisma.curriculum.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          _count: { select: { courses: true } },
        },
      }),
      prisma.curriculum.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageSubjects")
    if (authError) return authError

    const body = await req.json()
    const parsed = createCurriculumSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const created = await prisma.curriculum.create({
      data: parsed.data,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
