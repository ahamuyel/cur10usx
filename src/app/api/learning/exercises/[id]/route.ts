import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateExerciseSchema } from "@/lib/validations/academic"
import { stripExercise } from "@/lib/learning/secure"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const { id } = await params

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        lesson: { select: { id: true, schoolId: true, title: true } },
      },
    })

    if (!exercise || exercise.lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }

    if (role === "student") {
      return NextResponse.json(stripExercise(exercise))
    }

    return NextResponse.json(exercise)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.exercise.findUnique({
      where: { id },
      include: { lesson: { select: { schoolId: true } } },
    })
    if (!existing || existing.lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateExerciseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: parsed.data,
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.exercise.findUnique({
      where: { id },
      include: { lesson: { select: { schoolId: true } } },
    })
    if (!existing || existing.lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }

    await prisma.exercise.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
