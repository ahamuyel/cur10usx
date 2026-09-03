import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { createCurriculumCourseSchema } from "@/lib/validations/academic"
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

    const curriculum = await prisma.curriculum.findUnique({ where: { id } })
    if (!curriculum) {
      return NextResponse.json({ error: "Currículo não encontrado" }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      curriculumId: id,
      ...(search
        ? {
            name: { contains: search, mode: "insensitive" as const },
          }
        : {}),
    }

    const orderBy = buildOrderBy(searchParams, ["name", "grade", "createdAt"], { grade: "asc" })

    const [data, total] = await Promise.all([
      prisma.curriculumCourse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          _count: { select: { units: true } },
        },
      }),
      prisma.curriculumCourse.count({ where }),
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

    const curriculum = await prisma.curriculum.findUnique({ where: { id } })
    if (!curriculum) {
      return NextResponse.json({ error: "Currículo não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = createCurriculumCourseSchema.safeParse({ ...body, curriculumId: id })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const created = await prisma.curriculumCourse.create({
      data: parsed.data,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
