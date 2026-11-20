import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { startLesson } from "@/lib/learning/learningService"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["student"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const { id } = await params

    const lesson = await prisma.lesson.findUnique({ where: { id }, select: { schoolId: true, isPublished: true } })
    if (!lesson || lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Lição não encontrada" }, { status: 404 })
    }
    if (!lesson.isPublished) {
      return NextResponse.json({ error: "Lição não disponível" }, { status: 404 })
    }

    const student = await prisma.student.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 })
    }

    const result = await startLesson(prisma, student.id, id)
    return NextResponse.json(result)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
