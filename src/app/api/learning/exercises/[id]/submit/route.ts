import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { submitAnswerSchema } from "@/lib/validations/academic"
import { submitExerciseAttempt } from "@/lib/learning/learningService"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["student"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const { id } = await params

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: { lesson: { select: { schoolId: true, isPublished: true } } },
    })
    if (!exercise || exercise.lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }
    if (!exercise.isPublished || !exercise.lesson.isPublished) {
      return NextResponse.json({ error: "Exercício não disponível" }, { status: 404 })
    }

    const student = await prisma.student.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = submitAnswerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const outcome = await submitExerciseAttempt(
      prisma,
      student.id,
      id,
      parsed.data.answer,
      parsed.data.timeSpentMs
    )

    return NextResponse.json({ ...outcome, exerciseType: exercise.type })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message === "EXERCISE_UNAVAILABLE") {
      return NextResponse.json({ error: "Exercício não disponível" }, { status: 404 })
    }
    if (message === "EXERCISE_TYPE_UNSUPPORTED") {
      return NextResponse.json({ error: "Tipo de exercício não suportado" }, { status: 400 })
    }
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
