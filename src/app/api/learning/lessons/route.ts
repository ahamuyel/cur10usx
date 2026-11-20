import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createLearningLessonSchema } from "@/lib/validations/academic"
import { buildOrderBy } from "@/lib/query-helpers"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const topicId = searchParams.get("topicId") || ""
    const isPublished = searchParams.get("isPublished")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schoolId,
      ...(topicId ? { curriculumTopicId: topicId } : {}),
      ...(isPublished !== null && isPublished !== undefined
        ? { isPublished: isPublished === "true" }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const orderBy = buildOrderBy(searchParams, ["order", "createdAt"], { order: "asc" })

    const [data, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          curriculumTopic: { select: { id: true, title: true } },
          _count: { select: { exercises: true } },
        },
      }),
      prisma.lesson.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createLearningLessonSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const topic = await prisma.curriculumTopic.findUnique({
      where: { id: parsed.data.curriculumTopicId },
      select: { curriculumUnit: { select: { curriculum: { select: { schoolId: true } } } } },
    })

    if (!topic || topic.curriculumUnit.curriculum.schoolId !== schoolId) {
      return NextResponse.json({ error: "Tópico curricular não encontrado" }, { status: 404 })
    }

    const created = await prisma.lesson.create({
      data: {
        ...parsed.data,
        schoolId,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
