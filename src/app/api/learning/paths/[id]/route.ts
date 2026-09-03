import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getLearningPath } from "@/lib/learning/learningService"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["student"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const { id } = await params

    const student = await prisma.student.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 })
    }

    const course = await prisma.curriculumCourse.findUnique({
      where: { id },
      include: { subject: { select: { schoolId: true } } },
    })
    if (!course || !course.subject || course.subject.schoolId !== schoolId) {
      return NextResponse.json({ error: "Percurso não encontrado" }, { status: 404 })
    }

    const detail = await getLearningPath(prisma, student.id, id)
    if (!detail) {
      return NextResponse.json({ error: "Percurso não encontrado" }, { status: 404 })
    }

    return NextResponse.json(detail)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
