import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createExerciseSchema } from "@/lib/validations/academic"
import { stripExercises } from "@/lib/learning/secure"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const { id } = await params

    const lesson = await prisma.lesson.findUnique({ where: { id }, select: { schoolId: true } })
    if (!lesson || lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Lição não encontrada" }, { status: 404 })
    }

    const exercises = await prisma.exercise.findMany({
      where: { lessonId: id },
      orderBy: { order: "asc" },
    })

    if (role === "student") {
      return NextResponse.json(stripExercises(exercises))
    }

    return NextResponse.json(exercises)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const lesson = await prisma.lesson.findUnique({ where: { id }, select: { schoolId: true } })
    if (!lesson || lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Lição não encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = createExerciseSchema.safeParse({ ...body, lessonId: id })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const created = await prisma.exercise.create({
      data: parsed.data,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
