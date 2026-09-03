import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { createCurriculumUnitSchema } from "@/lib/validations/academic"
import { buildOrderBy } from "@/lib/query-helpers"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requirePermission(["school_admin", "teacher"], "canManageSubjects")
    if (authError) return authError

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const course = await prisma.curriculumCourse.findUnique({ where: { id } })
    if (!course) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      curriculumCourseId: id,
      ...(search
        ? {
            title: { contains: search, mode: "insensitive" as const },
          }
        : {}),
    }

    const orderBy = buildOrderBy(searchParams, ["order", "createdAt"], { order: "asc" })

    const [data, total] = await Promise.all([
      prisma.curriculumUnit.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          _count: { select: { topics: true } },
        },
      }),
      prisma.curriculumUnit.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requirePermission(["school_admin"], "canManageSubjects")
    if (authError) return authError

    const { id } = await params

    const course = await prisma.curriculumCourse.findUnique({ where: { id } })
    if (!course) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = createCurriculumUnitSchema.safeParse({ ...body, curriculumCourseId: id })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const created = await prisma.curriculumUnit.create({
      data: parsed.data,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
