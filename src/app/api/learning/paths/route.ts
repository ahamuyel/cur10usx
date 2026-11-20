import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getLearningPath } from "@/lib/learning/learningService"

export async function GET() {
  try {
    const { error: authError, session } = await requirePermission(["student"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id

    const student = await prisma.student.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 })
    }

    // Curriculum courses mapped to a Subject in this school are the student's learning paths.
    const subjects = await prisma.subject.findMany({
      where: { schoolId },
      select: { id: true, name: true },
    })
    const subjectIds = subjects.map((s) => s.id)

    const courses = await prisma.curriculumCourse.findMany({
      where: { subjectId: { in: subjectIds } },
      select: { id: true, name: true, grade: true, subjectId: true },
    })

    const paths = []
    for (const course of courses) {
      const detail = await getLearningPath(prisma, student.id, course.id)
      if (detail) {
        paths.push({
          id: detail.id,
          name: detail.name,
          grade: detail.grade,
          subjectId: detail.subjectId,
          subjectName: detail.subjectName,
          progress: detail.progress,
          completedLessons: detail.completedLessons,
          totalLessons: detail.totalLessons,
          continueLessonId: detail.continueLessonId,
        })
      }
    }

    return NextResponse.json({ paths })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
